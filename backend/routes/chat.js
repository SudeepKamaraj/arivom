const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const ChatSession = require('../models/Chat');
const auth = require('../middleware/auth');

// Process chat message
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
router.get('/chat/history/:sessionId', auth, async (req, res) => {
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
router.post('/chat/recommendations', auth, async (req, res) => {
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

    // Score and rank courses based on user profile
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

      // Interest matching
      const interestMatches = courseSkills.filter(skill => 
        userInterests.some(interest => 
          interest.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(interest.toLowerCase())
        )
      );
      score += interestMatches.length * 2;

      // Popularity boost
      score += Math.min((course.students || 0) / 1000, 2);

      // Rating boost
      if (course.rating && course.rating.average) {
        score += (course.rating.average - 3) * 0.5;
      }

      return {
        ...course.toObject(),
        recommendationScore: score,
        matchReasons: [
          ...skillMatches.map(skill => `Matches your ${skill} skills`),
          ...interestMatches.map(interest => `Aligns with your interest in ${interest}`)
        ]
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
router.post('/chat/study-schedule', auth, async (req, res) => {
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

    // Generate personalized schedule
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
router.get('/chat/progress', auth, async (req, res) => {
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

    // Get recent activity (placeholder - implement based on your activity tracking)
    const recentActivity = {
      weeklyHours: Math.floor(totalStudyTime * 0.2), // Rough estimate
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
  const lowerMessage = message.toLowerCase();

  try {
    // Course recommendation requests
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('course')) {
      const user = await User.findById(userId);
      if (!user) {
        return { text: "Please sign in to get personalized recommendations!" };
      }

      const courses = await Course.find({ isPublished: true }).limit(3);
      
      if (courses.length === 0) {
        return { text: "I'd love to recommend courses, but none are available right now. Please check back later!" };
      }

      const recommendationText = `Based on your profile, here are my top recommendations:\n\n${courses.map((course, index) => 
        `${index + 1}. **${course.title}**\n   • Level: ${course.level}\n   • Duration: ${course.duration || 'N/A'}\n   • Price: ${course.price === 0 ? 'Free' : `₹${course.price}`}\n   • Students: ${course.students || 0}\n`
      ).join('\n')}`;

      return {
        text: recommendationText,
        type: 'course-recommendation',
        data: { courses: courses.map(c => c.toObject()) }
      };
    }

    // Study schedule requests
    if (lowerMessage.includes('schedule') || lowerMessage.includes('plan') || lowerMessage.includes('time')) {
      return {
        text: `Here's a personalized study plan:\n\n📅 **Weekly Study Schedule:**\n\n**Monday-Wednesday-Friday:**\n• 1 hour of video content\n• 30 minutes of practice\n\n**Tuesday-Thursday:**\n• 45 minutes of review\n• 15 minutes of assessment\n\n**Weekend:**\n• 2 hours of project work\n• Community discussion\n\n💡 **Tips:**\n• Study consistently at the same time\n• Take breaks every 45 minutes\n• Review previous lessons weekly`,
        type: 'study-plan'
      };
    }

    // Progress requests
    if (lowerMessage.includes('progress') || lowerMessage.includes('status') || lowerMessage.includes('achievement')) {
      const user = await User.findById(userId);
      if (!user) {
        return { text: "Please sign in to view your progress!" };
      }

      return {
        text: `📊 **Your Learning Progress:**\n\n🎯 **Current Status:**\n• Courses enrolled: ${user.enrolledCourses?.length || 0}\n• Courses completed: ${user.completedCourses?.length || 0}\n• Total study time: ${user.totalStudyTime || 0} hours\n• Certificates earned: ${user.certificates?.length || 0}\n\n🏆 **Recent Achievements:**\n• Active Learner Badge\n• First Course Enrollment\n\n🎯 **Next Goals:**\n• Complete your current course\n• Earn your first certificate\n• Reach 10 hours of study time`,
        type: 'progress-report'
      };
    }

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const user = await User.findById(userId);
      const userName = user ? (user.firstName || user.username) : 'there';
      
      return {
        text: `Hello ${userName}! 👋 I'm your learning assistant. I can help you discover courses, create study plans, and track your progress. What would you like to explore today?`
      };
    }

    // Help requests
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return {
        text: `I'm here to make your learning journey smoother! Here's what I can help with:\n\n📚 **Course Discovery** - Find perfect courses based on your interests\n⏰ **Study Planning** - Create personalized study schedules\n📈 **Progress Tracking** - Monitor your learning achievements\n🎯 **Learning Guidance** - Answer questions about courses\n💡 **Study Tips** - Provide learning strategies\n\nJust ask me anything or use the quick action buttons!`
      };
    }

    // Default response with helpful suggestions
    return {
      text: `I understand you're asking about "${message}". While I'm continuously learning to understand all queries, I excel at:\n\n• **Course recommendations** - Just say "recommend courses"\n• **Study planning** - Ask for a "study schedule"\n• **Progress tracking** - Say "show my progress"\n\nWhat would you like to explore? You can also use the quick action buttons below for instant help! 🚀`
    };

  } catch (error) {
    console.error('Message processing error:', error);
    return { 
      text: "I encountered an issue processing your request. Please try again or use the quick action buttons!" 
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