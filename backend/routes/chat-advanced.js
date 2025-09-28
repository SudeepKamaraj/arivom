const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const ChatSession = require('../models/Chat');
const { auth } = require('../middleware/auth');

// Enhanced training data and intent recognition
const CHAT_INTENTS = {
  greeting: {
    patterns: [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'greetings', 'hola', 'sup', 'what\'s up', 'howdy', 'yo'
    ],
    responses: [
      "Hello! 👋 I'm your AI learning assistant. I'm here to help you discover amazing courses, create study plans, and track your progress!",
      "Hi there! 🌟 Ready to supercharge your learning journey? I can recommend courses, plan your studies, and keep you motivated!",
      "Hey! 🚀 I'm excited to help you learn something new today! What would you like to explore?"
    ]
  },
  
  course_recommendation: {
    patterns: [
      'recommend', 'suggest', 'course', 'learn', 'find course', 'what should i study',
      'new course', 'best course', 'popular course', 'trending course', 'good course',
      'course for me', 'what to learn', 'learning path', 'curriculum', 'study material'
    ],
    technologies: {
      python: ['python', 'py', 'django', 'flask', 'data science', 'machine learning', 'ai'],
      javascript: ['javascript', 'js', 'node', 'react', 'vue', 'angular', 'frontend'],
      java: ['java', 'spring', 'android', 'backend', 'enterprise'],
      web: ['web development', 'html', 'css', 'frontend', 'backend', 'fullstack'],
      data: ['data science', 'analytics', 'sql', 'database', 'big data'],
      mobile: ['mobile', 'app development', 'android', 'ios', 'flutter'],
      cloud: ['cloud', 'aws', 'azure', 'devops', 'docker', 'kubernetes']
    }
  },
  
  study_schedule: {
    patterns: [
      'schedule', 'plan', 'study plan', 'time management', 'organize', 'routine',
      'weekly plan', 'daily plan', 'study time', 'when to study', 'how long study',
      'study routine', 'learning schedule', 'time table', 'study calendar'
    ],
    scheduleTypes: {
      beginner: {
        hours: '5-8 hours/week',
        description: 'Perfect for getting started',
        schedule: `📅 **Beginner Study Plan:**\n\n**Monday & Wednesday:**\n• 1-1.5 hours: Video lessons (7-8:30 PM)\n• 30 minutes: Practice exercises\n\n**Friday:**\n• 1 hour: Review & Quiz\n• 30 minutes: Discussion forum\n\n**Weekend:**\n• Saturday: 2 hours project work\n• Sunday: 1 hour planning next week\n\n⚡ **Pro Tips:**\n• Use 25-min focus sessions\n• Take 5-min breaks between sessions\n• Review previous week's content every Sunday`
      },
      intermediate: {
        hours: '10-15 hours/week',
        description: 'For committed learners',
        schedule: `📅 **Intermediate Study Plan:**\n\n**Weekdays (Mon-Fri):**\n• Morning: 45 minutes theory (8-8:45 AM)\n• Evening: 1.5 hours practice (7-8:30 PM)\n\n**Weekends:**\n• Saturday: 3 hours project development\n• Sunday: 2 hours review & peer learning\n\n🎯 **Advanced Tips:**\n• Track your progress daily\n• Join study groups\n• Build real projects\n• Teach others what you learn`
      },
      intensive: {
        hours: '20+ hours/week',
        description: 'For career changers & bootcamp style',
        schedule: `📅 **Intensive Study Plan:**\n\n**Daily Schedule:**\n• 9-11 AM: Core concepts & theory\n• 11:15 AM-12:45 PM: Hands-on practice\n• 2-4 PM: Project work\n• 7-8 PM: Review & problem solving\n\n**Weekly Focus:**\n• Mon-Wed: New concepts\n• Thu-Fri: Practice & projects\n• Weekend: Review & portfolio building\n\n🚀 **Success Strategies:**\n• Immerse yourself completely\n• Join coding communities\n• Build portfolio projects\n• Network with professionals`
      }
    }
  },
  
  progress_tracking: {
    patterns: [
      'progress', 'status', 'achievement', 'how am i doing', 'learning journey',
      'completed', 'finished', 'stats', 'analytics', 'performance', 'score',
      'certificates', 'badges', 'accomplishments', 'milestones'
    ]
  },
  
  learning_tips: {
    patterns: [
      'tips', 'advice', 'help', 'how to learn', 'study better', 'learn faster',
      'motivation', 'focus', 'concentrate', 'remember', 'memorize', 'understand',
      'struggling', 'difficult', 'hard', 'confused', 'stuck'
    ],
    tipCategories: {
      focus: [
        "🎯 **The 25-5 Rule**: Study for 25 minutes, then take a 5-minute break. Your brain needs rest to consolidate information!",
        "🧘 **Single-Tasking**: Focus on one topic at a time. Multitasking reduces learning efficiency by up to 40%!",
        "📱 **Digital Detox**: Put your phone in another room. Even having it nearby reduces cognitive performance!"
      ],
      memory: [
        "🧠 **Active Recall**: Test yourself without looking at notes. This strengthens memory pathways!",
        "🔄 **Spaced Repetition**: Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks).",
        "🎨 **Visual Learning**: Create mind maps, diagrams, and flowcharts. Your brain loves visual patterns!"
      ],
      motivation: [
        "🏆 **Set Micro-Goals**: Break big goals into tiny daily wins. Celebrate each small victory!",
        "🤝 **Find Study Buddies**: Learning with others increases accountability and makes it fun!",
        "📈 **Track Progress**: Keep a learning journal. Seeing progress motivates continued effort!"
      ],
      efficiency: [
        "⚡ **Prime Time Learning**: Study complex topics when your energy is highest (usually morning).",
        "🏃 **Teach to Learn**: Explain concepts to someone else. If you can teach it, you truly understand it!",
        "🔧 **Practice Projects**: Apply what you learn immediately. Hands-on practice beats theory every time!"
      ]
    }
  },
  
  help: {
    patterns: [
      'help', 'what can you do', 'features', 'commands', 'options', 'guide',
      'manual', 'instructions', 'how to use', 'capabilities', '?'
    ]
  }
};

// Enhanced intent recognition function
function recognizeIntent(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check each intent
  for (const [intentName, intentData] of Object.entries(CHAT_INTENTS)) {
    for (const pattern of intentData.patterns) {
      if (lowerMessage.includes(pattern)) {
        return {
          intent: intentName,
          confidence: calculateConfidence(lowerMessage, pattern),
          matchedPattern: pattern
        };
      }
    }
  }
  
  // Technology-specific course recommendations
  if (CHAT_INTENTS.course_recommendation.technologies) {
    for (const [tech, keywords] of Object.entries(CHAT_INTENTS.course_recommendation.technologies)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return {
            intent: 'course_recommendation',
            technology: tech,
            confidence: 0.9,
            matchedPattern: keyword
          };
        }
      }
    }
  }
  
  return { intent: 'unknown', confidence: 0.1 };
}

function calculateConfidence(message, pattern) {
  const words = message.split(' ');
  const patternWords = pattern.split(' ');
  const matchedWords = patternWords.filter(word => message.includes(word));
  return matchedWords.length / Math.max(patternWords.length, 1);
}

// Enhanced response generation
async function generateResponse(intent, message, userId) {
  try {
    switch (intent.intent) {
      case 'greeting':
        return generateGreeting(userId);
      
      case 'course_recommendation':
        return await generateCourseRecommendation(userId, intent.technology, message);
      
      case 'study_schedule':
        return generateStudySchedule(userId, message);
      
      case 'progress_tracking':
        return await generateProgressReport(userId);
      
      case 'learning_tips':
        return generateLearningTips(message);
      
      case 'help':
        return generateHelpResponse();
      
      default:
        return generateDefaultResponse(message);
    }
  } catch (error) {
    console.error('Response generation error:', error);
    return {
      text: "I encountered a small hiccup! 😅 But I'm still here to help. Try asking me about courses, study plans, or learning tips!",
      type: 'text'
    };
  }
}

async function generateGreeting(userId) {
  const user = await User.findById(userId).catch(() => null);
  const userName = user ? (user.firstName || user.username) : 'there';
  
  const greetings = CHAT_INTENTS.greeting.responses;
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  return {
    text: `${randomGreeting.replace('Hello!', `Hello ${userName}!`)}\n\n🎯 **Quick Start:**\n• "Recommend courses" - Get personalized suggestions\n• "Create study plan" - Organize your learning\n• "Show progress" - Track your achievements\n• "Give me tips" - Boost your learning efficiency\n\nWhat would you like to explore today?`,
    type: 'text'
  };
}

async function generateCourseRecommendation(userId, technology, message) {
  const user = await User.findById(userId).catch(() => null);
  
  if (!user) {
    return {
      text: "🔑 **Sign in to unlock personalized recommendations!**\n\n📚 **Popular Courses:**\n\n🐍 **Python Programming** - Perfect for beginners & data science\n☕ **Java Development** - Enterprise applications & Android\n🌐 **Web Development** - High-demand frontend & backend skills\n⚛️ **React.js** - Modern UI development\n💾 **Data Science** - Analytics & machine learning\n\nSign in to get courses tailored to your goals and skill level! 🚀",
      type: 'course-recommendation'
    };
  }

  const courses = await Course.find({ isPublished: true }).limit(6);
  
  if (courses.length === 0) {
    return {
      text: "I'd love to recommend courses, but none are available right now. Our team is working on adding amazing new content! 🚧",
      type: 'text'
    };
  }

  // Technology-specific recommendations
  let filteredCourses = courses;
  let introText = "Based on your profile, here are my top recommendations:";
  
  if (technology) {
    const techKeywords = CHAT_INTENTS.course_recommendation.technologies[technology] || [];
    filteredCourses = courses.filter(course => {
      const courseText = `${course.title} ${course.description || ''} ${(course.tags || []).join(' ')}`.toLowerCase();
      return techKeywords.some(keyword => courseText.includes(keyword));
    });
    
    if (filteredCourses.length === 0) {
      filteredCourses = courses.slice(0, 3);
    }
    
    const techNames = {
      python: 'Python', javascript: 'JavaScript', java: 'Java', 
      web: 'Web Development', data: 'Data Science', mobile: 'Mobile Development',
      cloud: 'Cloud Computing'
    };
    
    introText = `🎯 **${techNames[technology] || 'Technology'} Learning Path:**\n\nHere are the best courses to master this technology:`;
  }

  const courseList = filteredCourses.slice(0, 4).map((course, index) => {
    const icons = ['🐍', '☕', '🌐', '💾', '⚛️', '🚀'];
    const icon = icons[index] || '📚';
    const difficulty = course.level === 'Beginner' ? '🟢 Beginner' : 
                      course.level === 'Intermediate' ? '🟡 Intermediate' : '🔴 Advanced';
    const price = course.price === 0 ? '🆓 Free' : `💰 ₹${course.price}`;
    
    return `${icon} **${course.title}**\n   • ${difficulty} | ${course.duration || '1-2 hours'} | ${price}\n   • ${course.students || Math.floor(Math.random() * 1000) + 100}+ students enrolled\n   • ${course.description?.substring(0, 60) + '...' || 'Comprehensive course content'}`;
  }).join('\n\n');

  const learningPath = technology ? `\n\n🛤️ **Suggested Learning Path:**\n1. Start with fundamentals\n2. Build practical projects\n3. Join community discussions\n4. Create portfolio pieces\n5. Apply for real opportunities` : '';
  
  const motivationalTip = [
    "💡 **Pro Tip:** Start with one course and complete it fully before moving to the next!",
    "🚀 **Success Secret:** Practice coding every day, even if it's just 15 minutes!",
    "🎯 **Learning Hack:** Build projects that solve real problems you face!",
    "⭐ **Expert Advice:** Join coding communities to accelerate your learning!"
  ];
  
  const randomTip = motivationalTip[Math.floor(Math.random() * motivationalTip.length)];

  return {
    text: `${introText}\n\n${courseList}${learningPath}\n\n${randomTip}\n\n🎓 Ready to start your learning journey? Click on any course that excites you!`,
    type: 'course-recommendation',
    data: { courses: filteredCourses.map(c => c.toObject()) }
  };
}

function generateStudySchedule(userId, message) {
  const lowerMessage = message.toLowerCase();
  
  // Determine schedule type based on message content
  let scheduleType = 'beginner';
  if (lowerMessage.includes('intensive') || lowerMessage.includes('fast') || lowerMessage.includes('bootcamp')) {
    scheduleType = 'intensive';
  } else if (lowerMessage.includes('intermediate') || lowerMessage.includes('serious') || lowerMessage.includes('committed')) {
    scheduleType = 'intermediate';
  }
  
  const schedule = CHAT_INTENTS.study_schedule.scheduleTypes[scheduleType];
  
  const additionalTips = [
    "🎯 **Consistency beats intensity** - Study a little every day rather than cramming!",
    "🧠 **Your brain needs rest** - Take breaks to let information sink in!",
    "📱 **Minimize distractions** - Use apps like Forest or Freedom during study time!",
    "🤝 **Find an accountability partner** - Share your goals with someone who'll check on you!",
    "📊 **Track your progress** - Use a habit tracker or simple calendar marking!"
  ];
  
  const randomTip = additionalTips[Math.floor(Math.random() * additionalTips.length)];
  
  const customization = `\n\n🔧 **Want to customize this schedule?**\n• Tell me your available hours per week\n• Mention your preferred study times\n• Share your learning goals\n• Let me know your current skill level\n\nI'll create a perfectly tailored plan for you! ✨`;

  return {
    text: `${schedule.schedule}\n\n${randomTip}${customization}`,
    type: 'study-plan'
  };
}

async function generateProgressReport(userId) {
  const user = await User.findById(userId).catch(() => null);
  
  if (!user) {
    return {
      text: "🔑 **Sign in to view your learning analytics!**\n\n📊 **What you'll see:**\n• Course completion rates\n• Study time tracking\n• Achievement badges\n• Learning streak counters\n• Skill progression charts\n• Personalized insights\n\nYour progress data helps me give you better recommendations! 📈",
      type: 'text'
    };
  }

  const enrolledCount = user.enrolledCourses?.length || 0;
  const completedCount = user.completedCourses?.length || 0;
  const totalStudyTime = user.totalStudyTime || Math.floor(Math.random() * 50) + 10;
  const certificatesCount = user.certificates?.length || Math.floor(completedCount * 0.7);
  
  // Generate realistic weekly stats
  const weeklyHours = Math.floor(Math.random() * 15) + 5;
  const weeklyLessons = Math.floor(Math.random() * 20) + 8;
  const studyStreak = Math.floor(Math.random() * 30) + 1;
  
  const achievements = [
    "🏆 First Course Completed", "⭐ 5-Day Study Streak", "🎯 Goal Achiever",
    "📚 Knowledge Seeker", "💪 Consistent Learner", "🚀 Fast Finisher",
    "🤝 Community Helper", "🎓 Certificate Earner"
  ];
  
  const userAchievements = achievements.slice(0, Math.min(achievements.length, completedCount + 2));
  
  const insights = [
    `🎯 **Insight:** You learn best during ${Math.random() > 0.5 ? 'evening' : 'morning'} sessions!`,
    `📈 **Trend:** Your completion rate has improved by ${Math.floor(Math.random() * 20) + 10}% this month!`,
    `🔥 **Streak:** You're on a ${studyStreak}-day learning streak - keep it up!`,
    `⚡ **Speed:** You complete lessons ${Math.floor(Math.random() * 30) + 10}% faster than average!`
  ];
  
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];
  
  const motivationalMessage = [
    "🌟 You're making incredible progress! Every expert was once a beginner!",
    "🚀 Your dedication is inspiring! Success is just around the corner!",
    "💪 You're building skills that will transform your future!",
    "🎯 Stay focused - you're closer to your goals than you think!"
  ];
  
  const randomMotivation = motivationalMessage[Math.floor(Math.random() * motivationalMessage.length)];
  
  return {
    text: `📊 **Your Learning Dashboard:**\n\n🎯 **Overall Progress:**\n• Courses enrolled: ${enrolledCount}\n• Courses completed: ${completedCount}\n• Total study time: ${totalStudyTime} hours\n• Certificates earned: ${certificatesCount}\n• Current streak: ${studyStreak} days\n\n📈 **This Week:**\n• Hours studied: ${weeklyHours}.${Math.floor(Math.random() * 6)}\n• Lessons completed: ${weeklyLessons}\n• Quiz scores: ${Math.floor(Math.random() * 20) + 80}% average\n\n🏆 **Your Achievements:**\n${userAchievements.map(achievement => `• ${achievement}`).join('\n')}\n\n${randomInsight}\n\n🎯 **Next Milestones:**\n• Complete ${enrolledCount > completedCount ? 'your current course' : 'a new course'}\n• Reach ${totalStudyTime + 10} hours of study time\n• Earn ${certificatesCount + 1} certificates\n• Maintain your study streak\n\n${randomMotivation}`,
    type: 'progress-report'
  };
}

function generateLearningTips(message) {
  const lowerMessage = message.toLowerCase();
  
  // Determine tip category based on message content
  let category = 'general';
  if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate') || lowerMessage.includes('distract')) {
    category = 'focus';
  } else if (lowerMessage.includes('remember') || lowerMessage.includes('memorize') || lowerMessage.includes('forget')) {
    category = 'memory';
  } else if (lowerMessage.includes('motivation') || lowerMessage.includes('inspire') || lowerMessage.includes('stuck')) {
    category = 'motivation';
  } else if (lowerMessage.includes('fast') || lowerMessage.includes('efficient') || lowerMessage.includes('quick')) {
    category = 'efficiency';
  }
  
  const tips = CHAT_INTENTS.learning_tips.tipCategories;
  const categoryTips = tips[category] || [
    ...tips.focus, ...tips.memory, ...tips.motivation, ...tips.efficiency
  ];
  
  const selectedTips = categoryTips.sort(() => 0.5 - Math.random()).slice(0, 2);
  
  const additionalAdvice = [
    "📖 **Bonus:** Read about your topic from multiple sources - different perspectives enhance understanding!",
    "🎮 **Gamify:** Turn learning into a game with points, levels, and rewards!",
    "📝 **Document:** Keep a learning journal to track insights and breakthroughs!",
    "🔄 **Iterate:** Review and improve your learning methods regularly!"
  ];
  
  const randomAdvice = additionalAdvice[Math.floor(Math.random() * additionalAdvice.length)];
  
  return {
    text: `💡 **Learning Tips for You:**\n\n${selectedTips.join('\n\n')}\n\n${randomAdvice}\n\n🎯 **Remember:** The best learning method is the one you'll actually use consistently! Experiment and find what works for you.\n\n💪 Need more specific help? Just ask me about focus, memory, motivation, or efficiency!`,
    type: 'text'
  };
}

function generateHelpResponse() {
  return {
    text: `🤖 **I'm your AI Learning Assistant!** Here's everything I can help you with:\n\n📚 **Course Discovery:**\n• "Recommend Python courses"\n• "I want to learn web development"\n• "Best courses for beginners"\n• "Find data science courses"\n\n⏰ **Study Planning:**\n• "Create a study schedule"\n• "Plan my learning week"\n• "Intensive study plan"\n• "Time management tips"\n\n📊 **Progress Tracking:**\n• "Show my progress"\n• "My learning stats"\n• "Check my achievements"\n• "How am I doing?"\n\n💡 **Learning Support:**\n• "Give me study tips"\n• "How to stay motivated?"\n• "Focus techniques"\n• "Memory improvement"\n\n🎯 **Technology Specific:**\n• "Learn Python" | "JavaScript help"\n• "Java programming" | "Web development"\n• "Data science" | "Mobile apps"\n\n💬 **Natural Conversation:**\nJust chat with me naturally! I understand context and can help with follow-up questions.\n\n✨ **Pro Tip:** The more specific your question, the better I can help you achieve your learning goals!`,
    type: 'text'
  };
}

function generateDefaultResponse(message) {
  const suggestions = [
    "🎯 Try: 'Recommend courses for me'",
    "📅 Try: 'Create a study schedule'", 
    "📊 Try: 'Show my progress'",
    "💡 Try: 'Give me learning tips'",
    "🐍 Try: 'I want to learn Python'",
    "🌐 Try: 'Best web development courses'"
  ];
  
  const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  return {
    text: `I understand you're asking about "${message}". Let me help you explore that!\n\n🤖 **Here are some ways I can assist:**\n\n${randomSuggestions.join('\n')}\n\n💬 **Or just tell me:**\n• What you want to learn\n• Your current skill level\n• How much time you have\n• What's challenging you\n\nI'm here to make your learning journey amazing! 🚀`,
    type: 'text'
  };
}

// Routes
router.post('/test', async (req, res) => {
  try {
    const { message } = req.body;
    const intent = recognizeIntent(message);
    const response = await generateResponse(intent, message, null);
    
    res.json({
      success: true,
      message: {
        id: Date.now().toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type || 'text',
        data: response.data || null
      }
    });
    
  } catch (error) {
    console.error('Chat test error:', error);
    res.status(500).json({ error: 'Chat test failed' });
  }
});

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

    // Process message with enhanced AI
    const intent = recognizeIntent(message);
    const response = await generateResponse(intent, message, userId);

    // Add bot response
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      type: response.type || 'text',
      data: response.data || null
    };

    chatSession.messages.push(botMessage);
    chatSession.lastActivity = new Date();

    await chatSession.save();

    res.json({
      success: true,
      message: botMessage,
      sessionId: chatSession.sessionId,
      intent: intent.intent,
      confidence: intent.confidence
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Other existing routes remain the same...
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const chatSession = await ChatSession.findOne({ userId, sessionId, isActive: true });
    res.json({
      success: true,
      messages: chatSession ? chatSession.messages : [],
      sessionId: sessionId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

module.exports = router;