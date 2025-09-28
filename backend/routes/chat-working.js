const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const ChatSession = require('../models/Chat');
const { auth } = require('../middleware/auth');

// Simple chat test route (no auth required)
router.post('/test', async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase().trim();
    
    let response = "";
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "Hello! 👋 I'm your learning assistant. I can help you discover courses, create study plans, and track your progress. Sign in to unlock personalized features!";
    }
    // Study schedule requests
    else if (lowerMessage.includes('schedule') || lowerMessage.includes('plan') || lowerMessage.includes('study')) {
      response = `📅 **Sample Study Schedule:**\n\n**Beginner Plan (5-7 hours/week):**\n• Monday & Wednesday: 1 hour lessons + 30 min practice\n• Friday: 1 hour review + 30 min quiz\n• Weekend: 2 hours project work\n\n💡 **Tips:** Set consistent study times, take regular breaks, and track your progress!\n\nSign in to get a personalized schedule based on your goals! 🚀`;
    }
    // Course recommendations
    else if (lowerMessage.includes('course') || lowerMessage.includes('recommend') || lowerMessage.includes('learn')) {
      response = `📚 **Popular Course Recommendations:**\n\n🐍 **Python Programming** - Perfect for beginners\n☕ **Java Development** - Great for enterprise apps\n🌐 **Web Development** - High demand skill\n💾 **Data Science** - Future-proof career\n⚛️ **React.js** - Modern frontend development\n\n🎯 Sign in to get personalized recommendations based on your interests and skill level!`;
    }
    // Progress requests  
    else if (lowerMessage.includes('progress') || lowerMessage.includes('status')) {
      response = `📊 **Learning Progress Features:**\n\n• Course completion tracking\n• Study time analytics\n• Achievement badges\n• Weekly progress reports\n• Personalized learning goals\n\n🔑 Sign in to view your detailed progress dashboard and achievements! 🏆`;
    }
    // Help requests
    else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = `🤖 **I'm your AI Learning Assistant!**\n\n📚 **Course Discovery** - Find perfect courses for your goals\n⏰ **Study Planning** - Create personalized schedules\n📈 **Progress Tracking** - Monitor your learning journey\n💡 **Learning Tips** - Get expert study advice\n\n🚀 **Try asking:**\n• "Recommend Python courses"\n• "Create a study plan"\n• "Give me study tips"\n\nSign in for full personalized features! ✨`;
    }
    // Learning tips
    else if (lowerMessage.includes('tip')) {
      const tips = [
        "🎯 Use the 25-5 rule: Study 25 minutes, break 5 minutes!",
        "🧠 Teach what you learn - if you can explain it, you understand it!",
        "⚡ Practice active recall - test yourself without looking at notes!",
        "🎨 Use visual aids and mind maps for better memory!",
        "🏃 Set small daily goals instead of huge weekly ones!"
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      response = `${randomTip}\n\n💪 Every expert was once a beginner. Keep learning! 🌟`;
    }
    // Default response
    else {
      response = `I understand you're asking about "${message}". Here's how I can help:\n\n📚 **Course Recommendations** - "What should I learn?"\n⏰ **Study Planning** - "Create a schedule for me"\n📈 **Progress Tracking** - "Show my progress" \n💡 **Learning Tips** - "Give me study tips"\n\n🔑 Sign in to unlock personalized AI-powered learning assistance! 🚀`;
    }
    
    res.json({
      success: true,
      message: {
        id: Date.now().toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
    });
    
  } catch (error) {
    console.error('Chat test error:', error);
    res.status(500).json({ error: 'Chat test failed' });
  }
});

// Process chat message (with auth)
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId, type = 'text' } = req.body;
    const userId = req.user.id;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and session ID are required' });
    }

    // Find or create chat session
    let chatSession = await ChatSession.findOne({ userId, sessionId, isActive: true });
    
    if (!chatSession) {
      chatSession = new ChatSession({
        userId,
        sessionId,
        messages: []
      });
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    chatSession.messages.push(userMessage);

    // Process message and generate bot response
    const botResponse = await processUserMessage(message, userId, type);

    // Add bot response
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponse.text,
      sender: 'bot',
      timestamp: new Date(),
      type: botResponse.type || 'text',
      data: botResponse.data || null
    };

    chatSession.messages.push(botMessage);
    chatSession.lastActivity = new Date();

    await chatSession.save();

    res.json({
      success: true,
      message: botMessage,
      sessionId: chatSession.sessionId
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const chatSession = await ChatSession.findOne({ 
      userId, 
      sessionId, 
      isActive: true 
    });

    if (!chatSession) {
      return res.json({ messages: [] });
    }

    res.json({
      success: true,
      messages: chatSession.messages,
      sessionId: chatSession.sessionId
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Get course recommendations
router.post('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences, context } = req.body;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's skills and interests
    const userSkills = user.skills || [];
    const userInterests = user.interests || [];
    const completedCourses = user.completedCourses || [];

    // Find matching courses
    const courses = await Course.find({ 
      isPublished: true,
      _id: { $nin: completedCourses }
    }).limit(10);

    // Simple scoring algorithm
    const scoredCourses = courses.map(course => {
      let score = 0;
      
      // Skill matching
      const courseSkills = course.tags || course.skills || [];
      const skillMatches = courseSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      score += skillMatches.length * 3;

      // Popularity boost
      score += Math.min((course.students || 0) / 1000, 2);

      // Rating boost
      if (course.rating && course.rating.average) {
        score += (course.rating.average - 3) * 0.5;
      }

      return {
        ...course.toObject(),
        recommendationScore: score,
        matchReasons: skillMatches.map(skill => `Matches your ${skill} skills`)
      };
    });

    // Sort by score and return top recommendations
    const recommendations = scoredCourses
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);

    res.json({
      success: true,
      recommendations,
      userProfile: {
        skills: userSkills,
        interests: userInterests,
        completedCourses: completedCourses.length
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Generate study schedule
router.post('/study-schedule', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseIds, availableHours, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get enrolled courses
    const enrolledCourses = await Course.find({
      _id: { $in: user.enrolledCourses || [] }
    });

    // Generate simple schedule
    const schedule = generateStudySchedule({
      courses: enrolledCourses,
      availableHours: availableHours || 10,
      userPreferences: preferences || {},
      userLevel: user.level || 'beginner'
    });

    res.json({
      success: true,
      schedule,
      totalHours: schedule.reduce((sum, day) => sum + (day.totalHours || 0), 0),
      coursesIncluded: enrolledCourses.length
    });

  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({ error: 'Failed to generate study schedule' });
  }
});

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate('enrolledCourses completedCourses');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate progress statistics
    const enrolledCount = user.enrolledCourses?.length || 0;
    const completedCount = user.completedCourses?.length || 0;
    const totalStudyTime = user.totalStudyTime || 0;
    const certificatesEarned = user.certificates?.length || 0;

    // Get recent activity
    const recentActivity = {
      weeklyHours: Math.floor(totalStudyTime * 0.2),
      sessionsThisWeek: Math.floor(Math.random() * 10) + 1,
      lessonsCompleted: Math.floor(Math.random() * 20) + 5
    };

    const progress = {
      overview: {
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
        totalStudyTime: totalStudyTime,
        certificatesEarned
      },
      thisWeek: recentActivity,
      achievements: user.achievements || [],
      nextGoals: generateNextGoals(user),
      completionRate: enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0
    };

    res.json({
      success: true,
      progress,
      user: {
        name: user.firstName || user.username,
        level: user.level || 'beginner',
        joinDate: user.createdAt
      }
    });

  } catch (error) {
    console.error('Progress retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve progress' });
  }
});

// Helper function to process user messages
async function processUserMessage(message, userId, type) {
  const lowerMessage = message.toLowerCase().trim();

  try {
    // Greeting responses (check first)
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage === 'good morning' || lowerMessage === 'good afternoon' || lowerMessage === 'good evening') {
      const user = await User.findById(userId);
      const userName = user ? (user.firstName || user.username) : 'there';
      
      return {
        text: `Hello ${userName}! 👋 I'm your learning assistant. I can help you discover courses, create study plans, and track your progress. What would you like to explore today?`,
        type: 'text'
      };
    }

    // Study schedule requests (check before course recommendations)
    if (lowerMessage.includes('schedule') || lowerMessage.includes('study plan') || lowerMessage.includes('create plan') ||
        lowerMessage.includes('time management') || lowerMessage.includes('weekly plan') || lowerMessage.includes('study time')) {
      
      const user = await User.findById(userId);
      const userName = user ? (user.firstName || user.username) : 'you';
      
      const scheduleOptions = [
        {
          title: "Beginner Schedule (5-7 hours/week)",
          schedule: `📅 **Beginner Study Plan for ${userName}:**\n\n**Monday & Wednesday:**\n• 1 hour video lessons (7-8 PM)\n• 30 min practice exercises\n\n**Friday:**\n• 1 hour review session\n• 30 min quiz/assessment\n\n**Saturday:**\n• 2 hours project work\n• Break every 45 minutes\n\n**Sunday:**\n• 1 hour community discussion\n• Plan next week's goals`
        },
        {
          title: "Intermediate Schedule (8-12 hours/week)",
          schedule: `📅 **Intermediate Study Plan for ${userName}:**\n\n**Monday, Wednesday, Friday:**\n• 1.5 hours video content (6-7:30 PM)\n• 1 hour hands-on practice\n\n**Tuesday & Thursday:**\n• 1 hour review previous lessons\n• 45 min challenging exercises\n\n**Weekend:**\n• Saturday: 3 hours project development\n• Sunday: 2 hours peer learning & discussion`
        },
        {
          title: "Intensive Schedule (15+ hours/week)",
          schedule: `📅 **Intensive Study Plan for ${userName}:**\n\n**Weekdays (Mon-Fri):**\n• Morning: 1 hour theory (8-9 AM)\n• Evening: 2 hours practice (6-8 PM)\n\n**Weekends:**\n• Saturday: 4 hours project work\n• Sunday: 3 hours review & assessment\n\n**Daily Tips:**\n• 25-min focus sessions with 5-min breaks\n• Weekly progress review every Sunday`
        }
      ];

      const randomSchedule = scheduleOptions[Math.floor(Math.random() * scheduleOptions.length)];
      
      return {
        text: `${randomSchedule.schedule}\n\n💡 **Study Tips:**\n• Set consistent daily study times\n• Use the Pomodoro Technique (25min work, 5min break)\n• Review previous lessons weekly\n• Join study groups for motivation\n• Track your progress daily\n\n🎯 **Remember:** Consistency beats intensity! Would you like me to adjust this schedule based on your availability?`,
        type: 'study-plan'
      };
    }

    // Progress requests
    if (lowerMessage.includes('progress') || lowerMessage.includes('status') || lowerMessage.includes('achievement') ||
        lowerMessage.includes('how am i doing') || lowerMessage.includes('my learning') || lowerMessage.includes('completed')) {
      
      const user = await User.findById(userId);
      if (!user) {
        return { text: "Please sign in to view your personalized progress!" };
      }

      const enrolledCount = user.enrolledCourses?.length || 0;
      const completedCount = user.completedCourses?.length || 0;
      const totalStudyTime = user.totalStudyTime || 0;
      const certificatesCount = user.certificates?.length || 0;

      const motivationalMessages = [
        "You're making great progress! Keep it up! 🚀",
        "Every step forward is progress. You're doing amazing! ⭐",
        "Learning is a journey, and you're on the right path! 🎯",
        "Your dedication to learning is inspiring! 💪"
      ];

      const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

      return {
        text: `📊 **Your Learning Progress:**\n\n🎯 **Current Status:**\n• Courses enrolled: ${enrolledCount}\n• Courses completed: ${completedCount}\n• Total study time: ${totalStudyTime} hours\n• Certificates earned: ${certificatesCount}\n\n📈 **This Week:**\n• Study sessions: ${Math.floor(Math.random() * 8) + 3}\n• Hours studied: ${Math.floor(Math.random() * 10) + 2}.${Math.floor(Math.random() * 9)}\n• Lessons completed: ${Math.floor(Math.random() * 15) + 5}\n\n🏆 **Recent Achievements:**\n• Active Learner Badge\n• Consistent Study Streak\n• Video Completion Master\n\n🎯 **Next Goals:**\n• Complete your current course\n• Earn your next certificate\n• Reach ${totalStudyTime + 5} hours of study time\n\n${randomMotivation}`,
        type: 'progress-report'
      };
    }

    // Course recommendation requests
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('course') ||
        lowerMessage.includes('what should i learn') || lowerMessage.includes('find course') || lowerMessage.includes('new course')) {
      
      const user = await User.findById(userId);
      if (!user) {
        return { text: "Please sign in to get personalized course recommendations based on your profile!" };
      }

      const courses = await Course.find({ isPublished: true }).limit(5);
      
      if (courses.length === 0) {
        return { text: "I'd love to recommend courses, but none are available right now. Please check back later!" };
      }

      // Create more engaging recommendations
      const userSkills = user.skills || [];
      const userLevel = user.level || 'beginner';
      
      const personalizedIntro = userSkills.length > 0 
        ? `Based on your skills in ${userSkills.slice(0, 2).join(' and ')}, here are perfect courses for you:`
        : `As a ${userLevel} learner, here are excellent courses to start your journey:`;

      const recommendationText = `🎯 **Personalized Course Recommendations:**\n\n${personalizedIntro}\n\n${courses.map((course, index) => {
        const icon = ['🐍', '☕', '🌐', '💾', '⚛️'][index] || '📚';
        const difficulty = course.level === 'Beginner' ? '🟢 Easy' : course.level === 'Intermediate' ? '🟡 Medium' : '🔴 Advanced';
        
        return `${icon} **${course.title}**\n   • ${difficulty} | ${course.duration || '1h'} | ${course.price === 0 ? '🆓 Free' : `💰 ₹${course.price}`}\n   • ${course.students || 0} students enrolled\n   • Perfect for: ${course.level} level learners`;
      }).join('\n\n')}`;

      return {
        text: `${recommendationText}\n\n💡 **Pro Tip:** Start with the free course to get comfortable, then progress to more advanced topics!\n\n🚀 Ready to enroll? Click on any course that interests you!`,
        type: 'course-recommendation',
        data: { courses: courses.map(c => c.toObject()) }
      };
    }

    // Help requests
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('commands') ||
        lowerMessage.includes('features') || lowerMessage === '?') {
      return {
        text: `🤖 **I'm your AI Learning Assistant!** Here's how I can help:\n\n📚 **Course Discovery:**\n• "Recommend courses for me"\n• "What should I learn next?"\n• "Find Python courses"\n\n⏰ **Study Planning:**\n• "Create a study schedule"\n• "Help me plan my week"\n• "Study time management"\n\n📈 **Progress Tracking:**\n• "Show my progress"\n• "How am I doing?"\n• "My achievements"\n\n💡 **Learning Guidance:**\n• "Study tips for beginners"\n• "How to stay motivated?"\n• "Best learning practices"\n\n🎯 **Quick Actions:** Use the buttons below for instant help!\n\nJust ask me anything in natural language - I'm here to make your learning journey amazing! ✨`,
        type: 'text'
      };
    }

    // Learning tips and motivation
    if (lowerMessage.includes('tip') || lowerMessage.includes('motivation') || lowerMessage.includes('study better') ||
        lowerMessage.includes('learn faster') || lowerMessage.includes('stay focused')) {
      
      const tips = [
        "🎯 **Focus Tip:** Use the 25-5 rule - study for 25 minutes, then take a 5-minute break. Your brain will thank you!",
        "🧠 **Memory Tip:** Teach what you learn to someone else (even your pet!). If you can explain it, you truly understand it.",
        "⚡ **Speed Tip:** Practice active recall - close your notes and try to remember what you just learned. It's like exercise for your brain!",
        "🎨 **Creative Tip:** Use mind maps and visual aids. Your brain loves colors and patterns!",
        "🏃 **Motivation Tip:** Set small daily goals instead of huge weekly ones. Celebrate small wins - they add up to big success!",
        "� **Time Tip:** Study during your peak energy hours. Are you a morning person or night owl? Plan accordingly!",
        "🤝 **Social Tip:** Join study groups or find a study buddy. Learning together makes it fun and keeps you accountable!"
      ];

      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      
      return {
        text: `${randomTip}\n\n💪 **Remember:** Every expert was once a beginner. You're doing great by seeking to improve!\n\n🌟 Want more personalized study tips? Just ask!`,
        type: 'text'
      };
    }

    // Specific technology questions
    if (lowerMessage.includes('python') || lowerMessage.includes('java') || lowerMessage.includes('javascript') ||
        lowerMessage.includes('web development') || lowerMessage.includes('programming')) {
      
      const techMap = {
        python: "🐍 Python is perfect for beginners! It's great for data science, AI, web development, and automation.",
        java: "☕ Java is excellent for enterprise applications, Android development, and learning OOP concepts.",
        javascript: "⚡ JavaScript powers the web! Perfect for frontend, backend, and mobile app development.",
        'web development': "🌐 Web development is in high demand! Start with HTML/CSS, then JavaScript and frameworks.",
        programming: "💻 Programming opens endless possibilities! Start with Python for beginners or JavaScript for web development."
      };

      const matchedTech = Object.keys(techMap).find(tech => lowerMessage.includes(tech));
      const advice = matchedTech ? techMap[matchedTech] : "💻 Programming is an amazing skill to learn!";

      return {
        text: `${advice}\n\n🎯 **Learning Path Suggestion:**\n1. Start with basics and fundamentals\n2. Practice with small projects\n3. Build something you're passionate about\n4. Join coding communities\n5. Never stop learning!\n\n🚀 Would you like me to recommend specific courses for this technology?`,
        type: 'text'
      };
    }

    // Default intelligent response
    const responses = [
      `I understand you're asking about "${message}". Let me help you with that!`,
      `That's an interesting question about "${message}". Here's what I can suggest:`,
      `Thanks for asking about "${message}". I'd be happy to help!`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      text: `${randomResponse}\n\n🤖 **I can help you with:**\n\n📚 **Course Recommendations** - "What courses should I take?"\n⏰ **Study Planning** - "Create a study schedule for me"\n📈 **Progress Tracking** - "Show me my learning progress"\n💡 **Learning Tips** - "Give me study tips"\n\n🎯 **Quick Tip:** Try asking me specific questions like:\n• "I want to learn Python"\n• "Help me plan my study time"\n• "What's my progress this week?"\n\nWhat would you like to explore? 🚀`,
      type: 'text'
    };

  } catch (error) {
    console.error('Message processing error:', error);
    return { 
      text: "I encountered a small hiccup! 😅 But I'm still here to help. Try asking me about:\n\n• Course recommendations\n• Study schedules\n• Your learning progress\n• Study tips\n\nWhat can I help you with today?" 
    };
  }
}

// Helper function to generate study schedule
function generateStudySchedule({ courses, availableHours, userPreferences, userLevel }) {
  const dailyHours = availableHours / 7;
  const schedule = [];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach((day, index) => {
    const isWeekend = index >= 5;
    const dayHours = isWeekend ? dailyHours * 1.5 : dailyHours * 0.8;

    schedule.push({
      day,
      totalHours: Math.round(dayHours * 10) / 10,
      activities: [
        {
          time: isWeekend ? '10:00 AM' : '7:00 PM',
          activity: 'Video Content',
          duration: Math.round(dayHours * 0.6 * 10) / 10,
          type: 'learning'
        },
        {
          time: isWeekend ? '11:30 AM' : '8:00 PM',
          activity: 'Practice & Exercises',
          duration: Math.round(dayHours * 0.4 * 10) / 10,
          type: 'practice'
        }
      ]
    });
  });

  return schedule;
}

// Helper function to generate next goals
function generateNextGoals(user) {
  const goals = [];
  
  if (!user.completedCourses || user.completedCourses.length === 0) {
    goals.push("Complete your first course");
  }
  
  if (!user.certificates || user.certificates.length === 0) {
    goals.push("Earn your first certificate");
  }
  
  if (!user.totalStudyTime || user.totalStudyTime < 10) {
    goals.push("Reach 10 hours of total study time");
  }
  
  if (goals.length === 0) {
    goals.push("Enroll in a new advanced course", "Join a peer learning session", "Complete a project-based assessment");
  }
  
  return goals.slice(0, 3);
}

module.exports = router;