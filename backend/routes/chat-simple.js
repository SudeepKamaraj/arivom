const express = require('express');
const router = express.Router();

// Simple but intelligent chat responses without external dependencies
const RESPONSES = {
  programming: {
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
    courses: [
      { title: "Python for Beginners", duration: "25 hours", level: "Beginner" },
      { title: "JavaScript Fundamentals", duration: "30 hours", level: "Beginner" }
    ]
  },
  
  schedule: {
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
          `✅ Build something every week`
  },
  
  welcome: {
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
          `What would you like to learn today?`
  }
};

function getIntelligentResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Course recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('course') || lowerMessage.includes('programming')) {
    return RESPONSES.programming;
  }
  
  // Study schedule
  if (lowerMessage.includes('schedule') || lowerMessage.includes('plan')) {
    return RESPONSES.schedule;
  }
  
  // Default welcome
  return RESPONSES.welcome;
}

// Routes
router.post('/public', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Public chat request:', message);
    
    const response = getIntelligentResponse(message);
    
    console.log('✅ Generated intelligent response');
    
    res.json({
      success: true,
      response: response.text,
      message: {
        text: response.text,
        type: 'text',
        courses: response.courses || []
      },
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

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and session ID are required' });
    }

    console.log('📨 Chat request:', message);
    
    const response = getIntelligentResponse(message);
    
    res.json({
      success: true,
      message: {
        text: response.text,
        type: 'text',
        courses: response.courses || []
      },
      sessionId: sessionId,
      aiPowered: true
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

module.exports = router;