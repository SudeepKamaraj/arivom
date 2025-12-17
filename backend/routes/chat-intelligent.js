const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const geminiAI = require('../services/geminiAI');

// Enhanced chat with intelligent responses
const COURSE_TOPICS = {
  programming: ['JavaScript', 'Python', 'Java', 'C++', 'Web Development', 'Mobile Development'],
  data_science: ['Machine Learning', 'Data Analysis', 'Python for Data Science', 'Statistics'],
  web_development: ['HTML/CSS', 'React', 'Node.js', 'Full Stack Development'],
  mobile: ['React Native', 'Flutter', 'iOS Development', 'Android Development']
};

const SAMPLE_COURSES = [
  {
    title: "Complete JavaScript Masterclass",
    description: "Learn JavaScript from basics to advanced concepts",
    technology: "JavaScript",
    level: "Beginner to Advanced",
    duration: "40 hours"
  },
  {
    title: "Python for Beginners",
    description: "Start your programming journey with Python",
    technology: "Python", 
    level: "Beginner",
    duration: "25 hours"
  },
  {
    title: "React Frontend Development",
    description: "Build modern web applications with React",
    technology: "React",
    level: "Intermediate",
    duration: "30 hours"
  },
  {
    title: "Machine Learning Fundamentals",
    description: "Introduction to ML concepts and algorithms",
    technology: "Python",
    level: "Intermediate",
    duration: "35 hours"
  },
  {
    title: "Full Stack Web Development",
    description: "Complete web development with MERN stack",
    technology: "JavaScript",
    level: "Advanced",
    duration: "60 hours"
  }
];

// Intelligent response generation
function generateIntelligentResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Course recommendation patterns
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('course')) {
    if (lowerMessage.includes('programming') || lowerMessage.includes('coding')) {
      return generateProgrammingRecommendation();
    } else if (lowerMessage.includes('data science') || lowerMessage.includes('machine learning')) {
      return generateDataScienceRecommendation();
    } else if (lowerMessage.includes('web') || lowerMessage.includes('frontend') || lowerMessage.includes('backend')) {
      return generateWebDevRecommendation();
    } else {
      return generateGeneralRecommendation();
    }
  }
  
  // Study schedule requests
  if (lowerMessage.includes('study schedule') || lowerMessage.includes('study plan') || lowerMessage.includes('learning plan')) {
    return generateStudySchedule();
  }
  
  // Video tutorial requests
  if (lowerMessage.includes('video') || lowerMessage.includes('tutorial') || lowerMessage.includes('watch')) {
    return generateVideoRecommendation();
  }
  
  // Trending topics
  if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('hot topics')) {
    return generateTrendingTopics();
  }
  
  // Learning path requests
  if (lowerMessage.includes('learning path') || lowerMessage.includes('start learning') || lowerMessage.includes('begin')) {
    return generateLearningPath();
  }
  
  // Default intelligent greeting
  return generateWelcomeResponse();
}

function generateProgrammingRecommendation() {
  return {
    text: `🚀 **Excellent choice!** Programming is an amazing skill to develop. Here are my top recommendations:\n\n` +
          `📚 **Beginner-Friendly:**\n` +
          `• **Python for Beginners** - Perfect starting point, easy syntax\n` +
          `• **JavaScript Fundamentals** - Essential for web development\n\n` +
          `💼 **Career-Focused:**\n` +
          `• **Full Stack Web Development** - High demand in job market\n` +
          `• **Data Structures & Algorithms** - Interview preparation\n\n` +
          `🎯 **Quick Start Tips:**\n` +
          `1. Start with Python or JavaScript\n` +
          `2. Build small projects daily\n` +
          `3. Join coding communities\n\n` +
          `Would you like me to create a personalized learning path for you?`,
    type: 'text',
    courses: SAMPLE_COURSES.filter(course => 
      course.technology === 'JavaScript' || course.technology === 'Python'
    )
  };
}

function generateDataScienceRecommendation() {
  return {
    text: `📊 **Data Science is incredibly exciting!** Here's your roadmap:\n\n` +
          `🐍 **Foundation:**\n` +
          `• **Python for Data Science** - Essential programming skills\n` +
          `• **Statistics Fundamentals** - Mathematical foundation\n\n` +
          `🤖 **Advanced Topics:**\n` +
          `• **Machine Learning Algorithms** - Core ML concepts\n` +
          `• **Data Visualization** - Tell stories with data\n\n` +
          `📈 **Real-World Skills:**\n` +
          `• **SQL for Data Analysis** - Database querying\n` +
          `• **Big Data Tools** - Hadoop, Spark\n\n` +
          `💡 Start with Python basics, then move to data manipulation with pandas!`,
    type: 'text',
    courses: SAMPLE_COURSES.filter(course => 
      course.title.includes('Machine Learning') || course.technology === 'Python'
    )
  };
}

function generateWebDevRecommendation() {
  return {
    text: `🌐 **Web Development is fantastic!** Here's your complete roadmap:\n\n` +
          `🎨 **Frontend (What users see):**\n` +
          `• **HTML/CSS Basics** - Structure and styling\n` +
          `• **JavaScript Fundamentals** - Interactive features\n` +
          `• **React/Vue.js** - Modern frameworks\n\n` +
          `⚙️ **Backend (Behind the scenes):**\n` +
          `• **Node.js** - JavaScript on the server\n` +
          `• **Express.js** - Web framework\n` +
          `• **Database Management** - MongoDB/PostgreSQL\n\n` +
          `🚀 **Full Stack Path:**\n` +
          `Start with HTML/CSS → JavaScript → React → Node.js → Databases\n\n` +
          `Ready to build your first website?`,
    type: 'text',
    courses: SAMPLE_COURSES.filter(course => 
      course.technology === 'JavaScript' || course.technology === 'React'
    )
  };
}

function generateGeneralRecommendation() {
  return {
    text: `🎯 **Let me help you find the perfect course!** Here are our most popular options:\n\n` +
          `🔥 **Trending Now:**\n` +
          `• **AI & Machine Learning** - Future-proof skills\n` +
          `• **Cloud Computing** - High-demand field\n` +
          `• **Cybersecurity** - Protect digital assets\n\n` +
          `💼 **Career Boosters:**\n` +
          `• **Full Stack Development** - Versatile skills\n` +
          `• **Data Analysis** - Data-driven decisions\n` +
          `• **Mobile App Development** - Growing market\n\n` +
          `What specific area interests you most? I can provide detailed recommendations!`,
    type: 'text',
    courses: SAMPLE_COURSES.slice(0, 3)
  };
}

function generateStudySchedule() {
  return {
    text: `📅 **Perfect! Let me create a study schedule for you:**\n\n` +
          `🎯 **Recommended Weekly Schedule:**\n` +
          `• **Monday/Wednesday/Friday:** 2 hours - Core concepts\n` +
          `• **Tuesday/Thursday:** 1 hour - Practice coding\n` +
          `• **Saturday:** 3 hours - Project work\n` +
          `• **Sunday:** 1 hour - Review and plan\n\n` +
          `⏰ **Daily Breakdown:**\n` +
          `• 30 min: Theory/Concepts\n` +
          `• 60 min: Hands-on practice\n` +
          `• 30 min: Review and notes\n\n` +
          `💡 **Pro Tips:**\n` +
          `✅ Set specific daily goals\n` +
          `✅ Take regular breaks (Pomodoro technique)\n` +
          `✅ Build something every week\n\n` +
          `Would you like me to customize this based on your available time?`,
    type: 'text'
  };
}

function generateVideoRecommendation() {
  return {
    text: `📹 **Great choice! Video learning is very effective. Here are my recommendations:**\n\n` +
          `🎬 **Beginner-Friendly Videos:**\n` +
          `• "Programming Fundamentals in 60 Minutes"\n` +
          `• "Web Development Crash Course"\n` +
          `• "Python Basics for Complete Beginners"\n\n` +
          `🚀 **Interactive Tutorials:**\n` +
          `• "Build Your First Website" - Step by step\n` +
          `• "JavaScript Projects for Beginners"\n` +
          `• "Data Science with Python"\n\n` +
          `💡 **Learning Tips:**\n` +
          `✅ Code along with the videos\n` +
          `✅ Pause and practice concepts\n` +
          `✅ Take notes on key points\n\n` +
          `Which topic would you like to start with?`,
    type: 'text',
    videos: [
      {
        title: "Programming Fundamentals",
        url: "https://youtube.com/watch?v=example1",
        duration: "60 minutes"
      },
      {
        title: "Web Development Basics", 
        url: "https://youtube.com/watch?v=example2",
        duration: "45 minutes"
      }
    ]
  };
}

function generateTrendingTopics() {
  return {
    text: `🔥 **Here are the hottest programming topics right now:**\n\n` +
          `🤖 **AI & Machine Learning:**\n` +
          `• ChatGPT and LLMs\n` +
          `• Computer Vision\n` +
          `• Neural Networks\n\n` +
          `☁️ **Cloud & DevOps:**\n` +
          `• AWS/Azure certifications\n` +
          `• Docker & Kubernetes\n` +
          `• CI/CD pipelines\n\n` +
          `🌐 **Web Technologies:**\n` +
          `• Next.js & React 18\n` +
          `• TypeScript adoption\n` +
          `• Serverless architecture\n\n` +
          `📱 **Mobile Development:**\n` +
          `• React Native\n` +
          `• Flutter\n` +
          `• Progressive Web Apps\n\n` +
          `Which trending topic excites you most?`,
    type: 'text'
  };
}

function generateLearningPath() {
  return {
    text: `🎓 **Welcome to your learning journey! Let me guide you:**\n\n` +
          `📋 **Step 1: Choose Your Path**\n` +
          `• 💻 Programming & Software Development\n` +
          `• 🌐 Web Development (Frontend/Backend)\n` +
          `• 📊 Data Science & Analytics\n` +
          `• 📱 Mobile App Development\n\n` +
          `⚡ **Quick Start Options:**\n` +
          `• **Complete Beginner?** → Start with Python basics\n` +
          `• **Want to build websites?** → HTML/CSS/JavaScript\n` +
          `• **Interest in data?** → Python + Statistics\n` +
          `• **Mobile apps?** → React Native or Flutter\n\n` +
          `🎯 **Next Steps:**\n` +
          `1. Take our skill assessment quiz\n` +
          `2. Get your personalized roadmap\n` +
          `3. Start with beginner-friendly projects\n\n` +
          `What type of development interests you most?`,
    type: 'text'
  };
}

function generateWelcomeResponse() {
  return {
    text: `Hello! 👋 I'm your intelligent learning assistant and I'm excited to help you!\n\n` +
          `✨ **I can help you with:**\n` +
          `📚 **Course Recommendations** - Find perfect courses for your goals\n` +
          `📅 **Study Schedules** - Create optimized learning plans\n` +
          `📹 **Video Tutorials** - Curated video content\n` +
          `🎯 **Learning Paths** - Step-by-step career guidance\n` +
          `📈 **Trending Topics** - Latest in tech and programming\n\n` +
          `💬 **Try asking me:**\n` +
          `• "Recommend programming courses for beginners"\n` +
          `• "Create a study schedule for web development"\n` +
          `• "Show me trending programming topics"\n` +
          `• "Help me start learning Python"\n\n` +
          `What would you like to learn today?`,
    type: 'text'
  };
}

// Routes
router.post('/public', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Public chat request:', message);
    
    const response = generateIntelligentResponse(message);
    
    console.log('✅ Generated intelligent response');
    
    res.json({
      success: true,
      response: response.text,
      message: response,
      aiPowered: true
    });
    
  } catch (error) {
    console.error('❌ Public chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.',
      message: 'Something went wrong!'
    });
  }
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId, type = 'text' } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and session ID are required' });
    }

    console.log('📨 Authenticated chat request:', message);
    
    const response = generateIntelligentResponse(message);
    
    res.json({
      success: true,
      message: response,
      sessionId: sessionId,
      aiPowered: true
    });
    
  } catch (error) {
    console.error('❌ Authenticated chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

router.post('/teacher', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('👨‍🏫 Teacher chat request:', message);
    
    const response = generateIntelligentResponse(message);
    
    // Add teacher-specific enhancements
    const teacherResponse = {
      ...response,
      text: `🎓 **Your Learning Coach says:**\n\n${response.text}\n\n💡 **Remember:** Consistent practice is key to mastering any skill. I'm here to guide you every step of the way!`
    };
    
    res.json({
      success: true,
      response: teacherResponse,
      aiPowered: true
    });
    
  } catch (error) {
    console.error('❌ Teacher chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

module.exports = router;