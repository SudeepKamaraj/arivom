const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const ChatSession = require('../models/Chat');
const { auth } = require('../middleware/auth');
const geminiAI = require('../services/geminiAI');

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

  video_request: {
    patterns: [
      'show video', 'play video', 'watch video', 'video lesson', 'start course',
      'begin lesson', 'tutorial video', 'learning video', 'course video',
      'video content', 'watch course', 'start learning', 'begin course',
      'show lessons', 'course material', 'video series'
    ]
  },

  course_content: {
    patterns: [
      'course content', 'lesson plan', 'syllabus', 'curriculum', 'what will i learn',
      'course outline', 'topics covered', 'learning objectives', 'course structure',
      'lesson structure', 'modules', 'chapters'
    ]
  },
  
  course_recommendation: {
    patterns: [
      'recommend', 'suggest', 'course', 'learn', 'find course', 'what should i study',
      'new course', 'best course', 'popular course', 'trending course', 'good course',
      'course for me', 'what to learn', 'learning path', 'curriculum', 'study material',
      'trending', 'popular', 'hot', 'latest', 'new', 'best', 'top', 'programming',
      'topics', 'technologies', 'skills', 'programming topics', 'tech trends'
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
  },

  questionnaire: {
    patterns: [
      'start questionnaire', 'learning questionnaire', 'assessment', 'evaluate me',
      'what should i learn', 'help me choose', 'personalized', 'get started',
      'i want to start', 'guide me', 'recommend me', 'find courses for me',
      'i want to start learning programming', 'can you help me', 'help me learn',
      'learning path', 'guide', 'beginner', 'new to programming', 'getting started',
      'where to start', 'how to start', 'start learning', 'beginning', 'first steps'
    ]
  },

  teacher_response: {
    patterns: [
      // Experience levels
      'complete beginner', 'new to everything', 'never done', 'starting from scratch',
      'some experience', 'know basics', 'basics of', 'little experience',
      'intermediate', 'comfortable with', 'understand fundamentals', 'have experience',
      'advanced', 'expert', 'professional', 'looking to specialize',
      
      // Interest areas
      'programming', 'software development', 'coding', 'web development',
      'data science', 'analytics', 'mobile development', 'app development',
      'business', 'marketing', 'design', 'creative', 'ui ux',
      
      // Goals
      'career change', 'new job', 'advancement', 'promotion',
      'personal interest', 'hobby', 'for fun', 'curiosity',
      'current job', 'work', 'skill improvement', 'better at',
      'certification', 'academic', 'degree', 'exam prep'
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
async function generateResponse(intent, message, userId, sessionData = {}) {
  try {
    switch (intent.intent) {
      case 'greeting':
        return generateGreeting(userId);
      
      case 'course_recommendation':
        return await generateCourseRecommendation(userId, intent.technology, message);
      
      case 'video_request':
        return await generateVideoResponse(userId, message);
      
      case 'course_content':
        return await generateCourseContent(userId, message);
      
      case 'study_schedule':
        return generateStudySchedule(userId, message);
      
      case 'progress_tracking':
        return await generateProgressReport(userId);
      
      case 'learning_tips':
        return generateLearningTips(message);
      
      case 'questionnaire':
        return generateQuestionnaire(userId, sessionData);
      
      case 'teacher_response':
        return await generateTeacherResponse(userId, message, sessionData);
      
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

async function generateQuestionnaire(userId, sessionData) {
  try {
    const geminiAI = require('../services/geminiAI');
    // Check if this is the start of the questionnaire
    if (!sessionData || !sessionData.questionnaireStep) {
      // Return welcome questionnaire
      const welcomeData = geminiAI.getWelcomeQuestionnaire();
      return {
        text: welcomeData.message,
        type: welcomeData.type || 'questionnaire',
        quickActions: welcomeData.quickActions,
        step: welcomeData.step
      };
    }
    // Process based on current step
    const result = await geminiAI.processQuestionnaireStep(
      sessionData.questionnaireStep,
      sessionData.answers || {},
      sessionData.currentAnswer
    );
    return {
      text: result.message,
      type: result.type || 'questionnaire',
      sessionData: result.sessionData,
      videoUrl: result.videoUrl,
      videos: result.videos,
      courses: result.courses
    };
  } catch (error) {
    console.error('Questionnaire error:', error);
    return {
      text: "Let me help you find the perfect learning path! What programming experience do you have?",
      type: 'questionnaire'
    };
  }
}

async function generateTeacherResponse(userId, message, sessionData = {}) {
  try {
    console.log('🎓 generateTeacherResponse called with:', { userId, message });
    
    let user = null;
    let userName = 'there';
    
    if (userId) {
      user = await User.findById(userId).catch(() => null);
      userName = user ? (user.firstName || user.username) : 'there';
    }
    
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    // Analyze user's response to determine their profile
    const userProfile = analyzeUserResponse(message.toLowerCase());
    console.log('📊 User profile analyzed:', userProfile);
    
    // Get relevant courses based on their profile
    const courses = await Course.find({ isPublished: true });
    console.log('📚 Courses found:', courses.length);
    
    const recommendedCourses = filterCoursesByProfile(courses, userProfile);
    console.log('✅ Courses filtered:', recommendedCourses.length);
    
    // Use GeminiAI service for enhanced teaching response
    console.log('🤖 Loading GeminiAI service...');
    const geminiAI = require('../services/geminiAI');
    console.log('✅ GeminiAI service loaded');
    
    console.log('🧠 Getting learning tips...');
    const learningTips = geminiAI.getPersonalizedLearningTips(userProfile, recommendedCourses);
    console.log('✅ Learning tips generated:', learningTips.length);
    
    console.log('📅 Generating study plan...');
    const studyPlan = geminiAI.generateStudyPlan(userProfile, recommendedCourses.slice(0, 3));
    console.log('✅ Study plan generated');
    
    console.log('💪 Getting motivational message...');
    const motivationalMessage = geminiAI.getMotivationalMessage(userProfile);
    console.log('✅ Motivational message generated');
    
    // Generate personalized teacher response
    let teacherResponse = `Thank you for sharing that, ${userName}! 🎓\n\n`;
    
    // Add motivational message
    teacherResponse += `${motivationalMessage}\n\n`;
    
    // Add experience-based feedback
    if (userProfile.experience === 'beginner') {
      teacherResponse += `🌱 **Perfect! Everyone starts somewhere.** Being a beginner is exciting because you have so much to discover!\n\n`;
    } else if (userProfile.experience === 'intermediate') {
      teacherResponse += `👍 **Great foundation!** Having some experience means you can tackle more interesting projects.\n\n`;
    } else if (userProfile.experience === 'advanced') {
      teacherResponse += `🚀 **Impressive!** With your advanced skills, you can dive into specialized topics and cutting-edge technologies.\n\n`;
    }
    
    // Add interest-based guidance
    if (userProfile.interests.includes('programming')) {
      teacherResponse += `💻 **Programming is an excellent choice!** It opens doors to countless opportunities in tech.\n\n`;
    }
    if (userProfile.interests.includes('web-development')) {
      teacherResponse += `🌐 **Web development is in high demand!** You'll learn skills that are immediately applicable.\n\n`;
    }
    if (userProfile.interests.includes('data-science')) {
      teacherResponse += `📊 **Data science is the future!** You'll work with cutting-edge analytics and AI.\n\n`;
    }
    
    // Add personalized course recommendations
    teacherResponse += `📚 **Here are my personalized recommendations for you:**\n\n`;
    
    recommendedCourses.slice(0, 3).forEach((course, index) => {
      teacherResponse += `${index + 1}️⃣ **${course.title}**\n`;
      teacherResponse += `   👨‍🏫 Instructor: ${course.instructor}\n`;
      teacherResponse += `   ⏱️ Duration: ${course.duration}\n`;
      teacherResponse += `   📈 Level: ${course.level}\n`;
      if (course.price) {
        teacherResponse += `   💰 Price: ${course.price}\n`;
      }
      teacherResponse += `   📖 ${course.description || 'Comprehensive course covering all fundamentals'}\n\n`;
    });
    
    // Add study plan
    teacherResponse += `📅 **Your Personalized Study Plan:**\n\n`;
    teacherResponse += `⏰ **Duration:** ${studyPlan.duration}\n`;
    teacherResponse += `📖 **Schedule:** ${studyPlan.schedule}\n\n`;
    
    studyPlan.phases.forEach((phase, index) => {
      teacherResponse += `**${phase.phase}**\n`;
      teacherResponse += `${phase.description}\n`;
      teacherResponse += `Activities:\n`;
      phase.activities.forEach(activity => {
        teacherResponse += `• ${activity}\n`;
      });
      teacherResponse += `\n`;
    });
    
    // Add learning tips
    teacherResponse += `💡 **Learning Tips Just for You:**\n\n`;
    learningTips.slice(0, 4).forEach(tip => {
      teacherResponse += `• ${tip}\n`;
    });
    
    teacherResponse += `\n🎯 **Ready to start? Just say "Enroll me in [course name]" or ask me anything else!**`;
    
    return {
      text: teacherResponse,
      type: 'teacher-recommendation',
      userProfile: userProfile,
      studyPlan: studyPlan,
      recommendedCourses: recommendedCourses.slice(0, 3).map(course => ({
        title: course.title,
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
        price: course.price,
        description: course.description
      })),
      videos: studyPlan.phases[0]?.courses?.length > 0 ? [
        {
          title: `Getting Started with ${recommendedCourses[0]?.title || 'Programming'}`,
          url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          description: "Perfect introduction course for beginners",
          duration: "45 minutes"
        }
      ] : []
    };
    
  } catch (error) {
    console.error('💥 Teacher response error:', error);
    console.error('Error stack:', error.stack);
    
    // Return a safe fallback response
    return {
      text: `I appreciate you sharing that! 😊 Let me help you find the perfect courses. 

Based on what you've told me, I'd recommend exploring our course catalog. You can browse by category or let me know more specifically what you'd like to learn!

Feel free to ask me questions like:
• "Show me programming courses"
• "I want to learn web development"
• "What courses are good for beginners?"

I'm here to help guide your learning journey! �`,
      type: 'text'
    };
  }
}

function analyzeUserResponse(message) {
  const profile = {
    experience: 'beginner',
    interests: [],
    goals: []
  };
  
  // Analyze experience level
  if (message.includes('complete beginner') || message.includes('new to everything') || message.includes('never done')) {
    profile.experience = 'beginner';
  } else if (message.includes('some experience') || message.includes('know basics') || message.includes('little experience')) {
    profile.experience = 'intermediate';
  } else if (message.includes('intermediate') || message.includes('comfortable with') || message.includes('have experience')) {
    profile.experience = 'intermediate';
  } else if (message.includes('advanced') || message.includes('expert') || message.includes('professional')) {
    profile.experience = 'advanced';
  }
  
  // Analyze interests
  if (message.includes('programming') || message.includes('coding') || message.includes('software')) {
    profile.interests.push('programming');
  }
  if (message.includes('web development') || message.includes('website') || message.includes('frontend') || message.includes('backend')) {
    profile.interests.push('web-development');
  }
  if (message.includes('data science') || message.includes('analytics') || message.includes('machine learning') || message.includes('ai')) {
    profile.interests.push('data-science');
  }
  if (message.includes('mobile') || message.includes('app development') || message.includes('android') || message.includes('ios')) {
    profile.interests.push('mobile-development');
  }
  if (message.includes('design') || message.includes('ui') || message.includes('ux') || message.includes('creative')) {
    profile.interests.push('design');
  }
  if (message.includes('business') || message.includes('marketing') || message.includes('management')) {
    profile.interests.push('business');
  }
  
  // Analyze goals
  if (message.includes('career change') || message.includes('new job') || message.includes('switch careers')) {
    profile.goals.push('career-change');
  }
  if (message.includes('personal interest') || message.includes('hobby') || message.includes('for fun')) {
    profile.goals.push('personal-interest');
  }
  if (message.includes('current job') || message.includes('work') || message.includes('skill improvement')) {
    profile.goals.push('skill-improvement');
  }
  if (message.includes('certification') || message.includes('academic') || message.includes('exam')) {
    profile.goals.push('certification');
  }
  
  return profile;
}

function filterCoursesByProfile(courses, profile) {
  let scoredCourses = courses.map(course => {
    let score = 0;
    const courseText = `${course.title} ${course.description} ${course.category}`.toLowerCase();
    
    // Score based on interests
    profile.interests.forEach(interest => {
      if (interest === 'programming' && (courseText.includes('programming') || courseText.includes('coding') || courseText.includes('python') || courseText.includes('java') || courseText.includes('javascript'))) {
        score += 3;
      }
      if (interest === 'web-development' && (courseText.includes('web') || courseText.includes('html') || courseText.includes('css') || courseText.includes('react') || courseText.includes('node'))) {
        score += 3;
      }
      if (interest === 'data-science' && (courseText.includes('data') || courseText.includes('analytics') || courseText.includes('machine learning') || courseText.includes('ai'))) {
        score += 3;
      }
      if (interest === 'mobile-development' && (courseText.includes('mobile') || courseText.includes('app') || courseText.includes('android') || courseText.includes('ios'))) {
        score += 3;
      }
      if (interest === 'design' && (courseText.includes('design') || courseText.includes('ui') || courseText.includes('ux'))) {
        score += 3;
      }
      if (interest === 'business' && (courseText.includes('business') || courseText.includes('marketing') || courseText.includes('management'))) {
        score += 3;
      }
    });
    
    // Score based on experience level
    if (profile.experience === 'beginner' && (course.level === 'Beginner' || course.level === 'beginner')) {
      score += 2;
    } else if (profile.experience === 'intermediate' && (course.level === 'Intermediate' || course.level === 'intermediate')) {
      score += 2;
    } else if (profile.experience === 'advanced' && (course.level === 'Advanced' || course.level === 'advanced')) {
      score += 2;
    }
    
    return { ...course._doc, score };
  });
  
  // Sort by score and return top matches
  return scoredCourses.sort((a, b) => b.score - a.score);
}

async function generateGreeting(userId) {
  const user = await User.findById(userId).catch(() => null);
  const userName = user ? (user.firstName || user.username) : 'there';
  
  // Get user's learning history to personalize the greeting
  const completedCourses = user ? await Course.find({ 
    'enrolledStudents.student': userId,
    'enrolledStudents.completionPercentage': { $gt: 0 }
  }).catch(() => []) : [];

  const hasLearningHistory = completedCourses.length > 0;
  
  let teacherGreeting;
  
  if (hasLearningHistory) {
    // Returning student
    teacherGreeting = `Hello ${userName}! 👨‍🏫 Welcome back to your learning journey!

I see you've been making progress with ${completedCourses.length} course${completedCourses.length > 1 ? 's' : ''}. That's fantastic! 🎉

As your learning guide, I'd love to help you continue growing. Let me ask you a few questions to provide the best recommendations:

🤔 **What would you like to focus on next?**
• Building on what you've already learned
• Exploring a completely new skill area  
• Deepening your expertise in a specific topic
• Preparing for a career change or advancement

Just tell me what's on your mind, and I'll create a personalized learning path for you!`;
  } else {
    // New student
    teacherGreeting = `Hello ${userName}! 👨‍� Welcome to your learning adventure!

I'm your personal learning assistant and I'm excited to help you discover amazing new skills! Think of me as your friendly teacher who's here to guide you every step of the way.

To get you started on the perfect learning path, I'd love to know more about you:

🎯 **Let's start with these questions:**

1️⃣ **What's your current experience level?**
   • Complete beginner (new to everything)
   • Some experience (know basics of a topic)
   • Intermediate (comfortable with fundamentals)
   • Advanced (looking to specialize)

2️⃣ **What interests you most?**
   • Programming & Software Development
   • Data Science & Analytics
   • Web Development & Design
   • Mobile App Development
   • Business & Marketing
   • Creative Arts & Design

3️⃣ **What's your main goal?**
   • Career change or advancement
   • Personal interest & hobby
   • Skill improvement for current job
   • Academic or certification prep

Just answer any of these questions, and I'll help you find the perfect courses! 🚀`;
  }

  return {
    text: teacherGreeting,
    type: 'teacher-greeting',
    hasHistory: hasLearningHistory,
    completedCoursesCount: completedCourses.length
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

  try {
    // Get all available courses
    const courses = await Course.find({ isPublished: true });
    
    if (courses.length === 0) {
      return {
        text: "I'd love to recommend courses, but none are available right now. Our team is working on adding amazing new content! 🚧",
        type: 'text'
      };
    }

    // Get user's completed courses for context
    const completedCourses = await Course.find({ 
      'enrolledStudents.student': userId,
      'enrolledStudents.completed': true
    });

    // Prepare user profile with completed courses
    const userProfile = {
      ...user.toObject(),
      completedCourses: completedCourses.map(course => course.title)
    };

    // Use Gemini AI to generate personalized recommendations
    const geminiResponse = await geminiAI.getCourseRecommendations(
      userProfile, 
      courses,
      message
    );

    if (geminiResponse.success) {
      return {
        text: geminiResponse.recommendations,
        type: 'course-recommendation',
        data: {
          userProfile: {
            skills: user.skills,
            interests: user.interests,
            level: user.level
          },
          totalCourses: courses.length,
          completedCourses: completedCourses.length
        }
      };
    } else {
      // Fallback to original logic if Gemini fails
      return generateFallbackRecommendation(user, courses, technology);
    }

  } catch (error) {
    console.error('Gemini recommendation error:', error);
    // Fallback to original logic
    const courses = await Course.find({ isPublished: true }).limit(6);
    return generateFallbackRecommendation(user, courses, technology);
  }
}

// Fallback function for when Gemini AI is not available
function generateFallbackRecommendation(user, courses, technology) {
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
    text: `🤖 **I'm your AI Learning Assistant!** Here's everything I can help you with:\n\n📚 **Course Discovery:**\n• "Recommend Python courses"\n• "I want to learn web development"\n• "Best courses for beginners"\n• "Find data science courses"\n\n🎥 **Video Learning:**\n• "Show me videos"\n• "Play course videos"\n• "Video tutorials for React"\n• "Start video lessons"\n\n📖 **Course Content:**\n• "Course content for Python"\n• "What will I learn?"\n• "Show course structure"\n• "Lesson plan details"\n\n⏰ **Study Planning:**\n• "Create a study schedule"\n• "Plan my learning week"\n• "Intensive study plan"\n• "Time management tips"\n\n📊 **Progress Tracking:**\n• "Show my progress"\n• "My learning stats"\n• "Check my achievements"\n• "How am I doing?"\n\n💡 **Learning Support:**\n• "Give me study tips"\n• "How to stay motivated?"\n• "Focus techniques"\n• "Memory improvement"\n\n🎯 **Technology Specific:**\n• "Learn Python" | "JavaScript help"\n• "Java programming" | "Web development"\n• "Data science" | "Mobile apps"\n\n💬 **Natural Conversation:**\nJust chat with me naturally! I understand context and can help with follow-up questions.\n\n✨ **Pro Tip:** The more specific your question, the better I can help you achieve your learning goals!`,
    type: 'text'
  };
}

async function generateVideoResponse(userId, message) {
  try {
    const user = await User.findById(userId).catch(() => null);
    
    // Get courses with video content
    const courses = await Course.find({ 
      isPublished: true,
      'videos.0': { $exists: true } // Courses that have at least one video
    }).limit(6);

    if (courses.length === 0) {
      return {
        text: "🎥 **No video content available yet!**\n\nOur team is working hard to create amazing video lessons for you. Check back soon for:\n\n• Interactive video tutorials\n• Step-by-step coding guides\n• Expert-led masterclasses\n• Project-based learning\n\nIn the meantime, try exploring our other course materials! 📚",
        type: 'text'
      };
    }

    // Extract technology from message for filtering
    let filteredCourses = courses;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('python') || lowerMessage.includes('data science')) {
      filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes('python') || 
        course.category.toLowerCase().includes('python') ||
        course.category.toLowerCase().includes('data')
      );
    } else if (lowerMessage.includes('javascript') || lowerMessage.includes('react') || lowerMessage.includes('web')) {
      filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes('javascript') || 
        course.title.toLowerCase().includes('react') ||
        course.title.toLowerCase().includes('web') ||
        course.category.toLowerCase().includes('web')
      );
    } else if (lowerMessage.includes('java') && !lowerMessage.includes('javascript')) {
      filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes('java') && 
        !course.title.toLowerCase().includes('javascript')
      );
    }

    if (filteredCourses.length === 0) {
      filteredCourses = courses.slice(0, 3);
    }

    const courseList = filteredCourses.slice(0, 3).map((course, index) => {
      const videoCount = course.videos ? course.videos.length : 0;
      const totalDuration = course.videos ? 
        course.videos.reduce((sum, video) => sum + (video.duration || 0), 0) : course.duration;
      
      const hours = Math.floor(totalDuration / 60);
      const minutes = totalDuration % 60;
      const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      const icons = ['🎥', '📹', '🎬', '📺', '🎞️', '🖥️'];
      const icon = icons[index] || '🎥';
      
      return `${icon} **${course.title}**\n   • ${videoCount} video lessons | ${durationText}\n   • ${course.level} level | ${course.category}\n   • ${course.enrolledStudents?.length || 0} students enrolled`;
    }).join('\n\n');

    const videoTips = [
      "📖 **Pro Tip:** Take notes while watching videos for better retention!",
      "⏸️ **Learning Hack:** Pause and practice coding along with the instructor!",
      "🔄 **Expert Advice:** Rewatch difficult concepts until they click!",
      "📱 **Study Smart:** Watch on multiple devices to learn anywhere!"
    ];
    
    const randomTip = videoTips[Math.floor(Math.random() * videoTips.length)];

    const interactiveFeatures = user ? 
      "\n\n🎮 **Interactive Features:**\n• Pause and take notes\n• Speed control (0.5x to 2x)\n• Progress tracking\n• Bookmark important moments\n• Download for offline viewing" : 
      "\n\n🔑 **Sign in to unlock:**\n• Progress tracking\n• Video bookmarks\n• Offline downloads\n• Personalized playlists";

    return {
      text: `🎥 **Video Learning Hub**\n\nHere are your personalized video recommendations:\n\n${courseList}${interactiveFeatures}\n\n${randomTip}\n\n🚀 **Ready to start watching?** Click on any course to begin your video learning journey!`,
      type: 'video-playlist',
      data: { 
        courses: filteredCourses.slice(0, 3).map(course => ({
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          videos: course.videos || [],
          category: course.category,
          level: course.level,
          duration: course.duration,
          enrolledStudents: course.enrolledStudents?.length || 0
        }))
      }
    };

  } catch (error) {
    console.error('Video response generation error:', error);
    return {
      text: "🎥 I'm having trouble loading video content right now. Please try again in a moment, or ask me about courses, study tips, or progress tracking!",
      type: 'text'
    };
  }
}

async function generateCourseContent(userId, message) {
  try {
    // Get a sample course to show structure
    const course = await Course.findOne({ isPublished: true }).populate('instructor', 'firstName lastName');
    
    if (!course) {
      return {
        text: "📚 **Course content is being prepared!**\n\nOur expert instructors are creating comprehensive course materials. Soon you'll have access to:\n\n• Detailed lesson plans\n• Interactive assignments\n• Progress assessments\n• Practical projects\n• Certificate programs\n\nStay tuned for updates! 🎓",
        type: 'text'
      };
    }

    const videoLessons = course.videos && course.videos.length > 0 ? 
      course.videos.slice(0, 4).map((video, index) => 
        `   ${index + 1}. ${video.title} (${Math.floor(video.duration/60)}:${(video.duration%60).toString().padStart(2, '0')})`
      ).join('\n') : 
      "   • Coming soon - Video lessons in production";

    const assessments = course.assessments && course.assessments.length > 0 ?
      course.assessments.slice(0, 2).map((assessment, index) => 
        `   ${index + 1}. ${assessment.title} (${assessment.questions?.length || 0} questions)`
      ).join('\n') :
      "   • Interactive quizzes and assignments";

    const instructor = course.instructor ? 
      `${course.instructor.firstName} ${course.instructor.lastName}` : 
      "Expert Instructor";

    const learningPath = `📚 **${course.title}**\n\n👨‍💼 **Instructor:** ${instructor}\n📈 **Level:** ${course.level}\n⏱️ **Duration:** ${Math.floor(course.duration/60)} hours\n🎯 **Category:** ${course.category}\n\n📋 **Course Structure:**\n\n🎥 **Video Lessons:**\n${videoLessons}\n\n📝 **Assessments:**\n${assessments}\n\n🎯 **Learning Objectives:**\n   • Master core concepts and fundamentals\n   • Build practical, real-world projects\n   • Develop industry-ready skills\n   • Earn completion certificate\n\n💡 **What You'll Gain:**\n   • Hands-on experience\n   • Portfolio projects\n   • Industry insights\n   • Career advancement opportunities`;

    const nextSteps = userId ? 
      "\n\n🚀 **Ready to Start?**\n• Enroll now to access full content\n• Track your progress automatically\n• Join study groups and discussions\n• Get personalized feedback" :
      "\n\n🔑 **Sign up to:**\n• Access full course content\n• Track learning progress\n• Join the learning community\n• Earn certificates";

    return {
      text: `${learningPath}${nextSteps}`,
      type: 'course-structure',
      data: {
        courseId: course._id,
        title: course.title,
        instructor: instructor,
        duration: course.duration,
        level: course.level,
        videos: course.videos || [],
        assessments: course.assessments || []
      }
    };

  } catch (error) {
    console.error('Course content generation error:', error);
    return {
      text: "📚 I'm having trouble loading course content details right now. Try asking me about specific courses or learning topics!",
      type: 'text'
    };
  }
}

function generateDefaultResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Try to provide intelligent responses for common unmatched queries
  if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('hot')) {
    return {
      text: `🔥 **Trending Programming Topics & Technologies:**\n\n🚀 **Most Popular Right Now:**\n• **Python** - AI/ML, Data Science, Web Development\n• **JavaScript** - Full-stack Development, React, Node.js\n• **Cloud Computing** - AWS, Azure, DevOps\n• **AI & Machine Learning** - ChatGPT, Computer Vision\n• **Web3 & Blockchain** - Smart Contracts, DeFi\n• **Mobile Development** - React Native, Flutter\n\n📈 **Growing Fast:**\n• **Rust** - System programming, performance\n• **Go** - Microservices, backend development\n• **TypeScript** - Type-safe JavaScript\n• **Kubernetes** - Container orchestration\n\n💡 **Want to dive deeper?** Ask me:\n• "Recommend Python courses"\n• "Show me AI courses"\n• "Best JavaScript learning path"\n• "Cloud development courses"\n\nWhat technology interests you most? 🎯`,
      type: 'course-recommendation'
    };
  }
  
  if (lowerMessage.includes('python')) {
    return {
      text: `🐍 **Python is an excellent choice!** It's perfect for:\n\n🔥 **Hot Career Paths:**\n• **Data Science & Analytics** - High demand, great pay\n• **AI & Machine Learning** - Future-proof skills\n• **Web Development** - Django, Flask frameworks\n• **Automation & Scripting** - Save time, boost productivity\n• **Game Development** - Fun projects with Pygame\n\n📚 **Python Learning Path:**\n1. **Basics** - Syntax, variables, functions\n2. **Data Structures** - Lists, dictionaries, sets\n3. **Object-Oriented Programming** - Classes, inheritance\n4. **Libraries** - NumPy, Pandas, Matplotlib\n5. **Frameworks** - Django/Flask for web, TensorFlow for AI\n\n💡 **Ready to start?** Try asking:\n• "Recommend Python courses for beginners"\n• "Python for data science"\n• "Best Python projects for practice"\n\nWhat's your experience level with Python? 🎯`,
      type: 'course-recommendation'
    };
  }
  
  if (lowerMessage.includes('programming') || lowerMessage.includes('coding') || lowerMessage.includes('development')) {
    return {
      text: `💻 **Programming is an amazing skill to learn!** Here's what's popular:\n\n🌟 **Best Languages to Start:**\n• **Python** - Easy to learn, versatile\n• **JavaScript** - Essential for web development\n• **Java** - Enterprise development, Android apps\n• **C++** - Game development, system programming\n\n🎯 **Choose Based on Your Goals:**\n• **Web Development** → HTML, CSS, JavaScript, React\n• **Mobile Apps** → React Native, Flutter, Swift\n• **Data Science** → Python, R, SQL\n• **Game Development** → C#, C++, Unity\n• **AI/Machine Learning** → Python, TensorFlow, PyTorch\n\n📈 **Career Opportunities:**\n• Frontend Developer: $70K-120K\n• Backend Developer: $80K-130K\n• Full-Stack Developer: $85K-140K\n• Data Scientist: $90K-150K\n• AI Engineer: $100K-180K\n\n💡 **Want personalized recommendations?** Tell me:\n• Your experience level (beginner/intermediate/advanced)\n• What you want to build (websites/apps/games/AI)\n• How much time you can dedicate\n\nLet's find the perfect learning path for you! 🚀`,
      type: 'course-recommendation'
    };
  }
  
  // Default intelligent response
  const suggestions = [
    "🎯 Try: 'Recommend courses for me'",
    "📅 Try: 'Create a study schedule'", 
    "📊 Try: 'Show my progress'",
    "💡 Try: 'Give me learning tips'",
    "🎥 Try: 'Show me videos'",
    "📚 Try: 'Course content'",
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

// Public chat endpoint for unauthenticated users
router.post('/public', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process the message using our enhanced intent recognition
    const intent = recognizeIntent(message);
    const response = await generateResponse(intent, message, null);

    res.json({
      success: true,
      response: response.text,
      intent: intent.intent,
      confidence: intent.confidence,
      videos: response.data?.courses?.filter(course => course.videos?.length > 0) || [],
      courseContent: response.data || null,
      type: response.type || 'text'
    });

  } catch (error) {
    console.error('Public chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      intent: 'error'
    });
  }
});

// Teacher chat endpoint for personalized responses
router.post('/teacher', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🎓 Teacher endpoint called with message:', message);

    // Generate teacher response using the existing function
    const response = await generateTeacherResponse(null, message, {});

    res.json({
      success: true,
      response: response,
      type: 'teacher',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Teacher chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process teacher message',
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      type: 'error'
    });
  }
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId, type = 'text', sessionData } = req.body;
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
        messages: [],
        sessionData: sessionData || {}
      });
    } else if (sessionData) {
      // Update session data for questionnaire progress
      chatSession.sessionData = { ...chatSession.sessionData, ...sessionData };
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
    const response = await generateResponse(intent, message, userId, chatSession.sessionData);

    // Add bot response
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      type: response.type || 'text',
      data: response.data || null,
      videoUrl: response.videoUrl,
      videos: response.videos,
      courses: response.courses
    };

    chatSession.messages.push(botMessage);
    chatSession.lastActivity = new Date();

    // Update session data if returned from response
    if (response.sessionData) {
      chatSession.sessionData = { ...chatSession.sessionData, ...response.sessionData };
    }

    await chatSession.save();

    res.json({
      success: true,
      message: botMessage,
      sessionId: chatSession.sessionId,
      sessionData: chatSession.sessionData,
      intent: intent.intent,
      confidence: intent.confidence
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Questionnaire endpoint
router.post('/questionnaire/start', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const geminiAI = require('../services/geminiAI');
    
    const questionnaire = await geminiAI.getWelcomeQuestionnaire();
    
    res.json({
      success: true,
      questionnaire: questionnaire.message,
      type: 'questionnaire',
      sessionData: { questionnaireStep: 1, answers: {} }
    });
    
  } catch (error) {
    console.error('Questionnaire start error:', error);
    res.status(500).json({ error: 'Failed to start questionnaire' });
  }
});

router.post('/questionnaire/step', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { step, answers, currentAnswer } = req.body;
    const geminiAI = require('../services/geminiAI');
    
    const result = await geminiAI.processQuestionnaireStep(step, answers, currentAnswer);
    
    res.json({
      success: true,
      message: result.message,
      type: result.type || 'questionnaire',
      sessionData: result.sessionData,
      videoUrl: result.videoUrl,
      videos: result.videos,
      courses: result.courses
    });
    
  } catch (error) {
    console.error('Questionnaire step error:', error);
    res.status(500).json({ error: 'Failed to process questionnaire step' });
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

// Enhanced Gemini AI Chat Endpoint
router.post('/gemini-chat', auth, async (req, res) => {
  try {
    const { message, sessionId, requestType = 'general' } = req.body;
    const userId = req.user.id;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and session ID are required' });
    }

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

    // Add user message to session
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    chatSession.messages.push(userMessage);

    let geminiResponse;
    
    // Handle different types of requests
    switch (requestType) {
      case 'course-recommendation':
        // Get all available courses for recommendations
        const courses = await Course.find({ isPublished: true });
        const completedCourses = await Course.find({ 
          'enrolledStudents.student': userId,
          'enrolledStudents.completed': true
        });

        const userProfile = {
          ...user.toObject(),
          completedCourses: completedCourses.map(course => course.title)
        };

        geminiResponse = await geminiAI.getCourseRecommendations(
          userProfile, 
          courses,
          message
        );
        break;

      case 'progress-analysis':
        // Get user's course progress for analysis
        const enrolledCourses = await Course.find({ 
          'enrolledStudents.student': userId
        });
        const userCompletedCourses = await Course.find({ 
          'enrolledStudents.student': userId,
          'enrolledStudents.completed': true
        });

        geminiResponse = await geminiAI.analyzeUserProgress(
          user,
          userCompletedCourses,
          enrolledCourses
        );
        break;

      default:
        // General chat with conversation history
        const conversationHistory = chatSession.messages.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        geminiResponse = await geminiAI.generateChatResponse(
          message,
          user,
          conversationHistory
        );
    }

    // Handle Gemini response
    if (geminiResponse.success) {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: geminiResponse.recommendations || geminiResponse.analysis || geminiResponse.response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        source: 'gemini-ai'
      };

      chatSession.messages.push(botMessage);
      chatSession.lastActivity = new Date();
      await chatSession.save();

      res.json({
        success: true,
        message: botMessage,
        sessionId: sessionId,
        aiPowered: true,
        requestType: requestType
      });
    } else {
      // Use intelligent fallback response instead of generic error
      let fallbackText = '';
      
      if (geminiResponse.recommendations) {
        // Use the fallback recommendations from Gemini service
        fallbackText = geminiResponse.recommendations;
      } else if (geminiResponse.analysis) {
        // Use the fallback analysis from Gemini service
        fallbackText = geminiResponse.analysis;
      } else if (geminiResponse.response) {
        // Use the fallback chat response from Gemini service
        fallbackText = geminiResponse.response;
      } else {
        // Final fallback if nothing else is available
        fallbackText = "I'm here to help you with your learning journey! 🚀 Let me know what courses you're interested in, and I'll provide personalized recommendations based on your goals and current skills.";
      }
      
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        text: fallbackText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        source: 'smart-fallback'
      };

      chatSession.messages.push(fallbackMessage);
      chatSession.lastActivity = new Date();
      await chatSession.save();

      res.json({
        success: true,
        message: fallbackMessage,
        sessionId: sessionId,
        aiPowered: false, // Still shows as false but with intelligent content
        error: geminiResponse.error
      });
    }

  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: 'Our AI assistant is having a moment. Please try again!' 
    });
  }
});

// Endpoint to get intelligent course recommendations using Gemini AI
router.get('/ai-recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, level, query } = req.query;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build course query
    let courseQuery = { isPublished: true };
    if (category) courseQuery.category = category;
    if (level) courseQuery.level = level;

    // Get available courses
    const courses = await Course.find(courseQuery);
    
    // Get user's completed courses
    const completedCourses = await Course.find({ 
      'enrolledStudents.student': userId,
      'enrolledStudents.completed': true
    });

    const userProfile = {
      ...user.toObject(),
      completedCourses: completedCourses.map(course => course.title)
    };

    // Get AI recommendations
    const userQuery = query || `Recommend courses based on my skills: ${user.skills?.join(', ') || 'general learning'} and interests: ${user.interests || 'technology'}`;
    
    const geminiResponse = await geminiAI.getCourseRecommendations(
      userProfile, 
      courses,
      userQuery
    );

    if (geminiResponse.success) {
      res.json({
        success: true,
        recommendations: geminiResponse.recommendations,
        userProfile: {
          skills: user.skills,
          interests: user.interests,
          level: user.level,
          completedCourses: completedCourses.length
        },
        totalCourses: courses.length,
        aiPowered: true,
        timestamp: geminiResponse.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: geminiResponse.error,
        message: 'Failed to generate AI recommendations'
      });
    }

  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI recommendations',
      message: 'Our AI assistant is currently unavailable. Please try again later.'
    });
  }
});

module.exports = router;