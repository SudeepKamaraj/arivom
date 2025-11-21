const express = require('express');
const router = express.Router();

// Ultra-simple chat with minimal dependencies
router.post('/public', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Received message:', message);
    
    let responseText = "I'm your learning assistant! I can help you with courses, study schedules, and programming advice. What would you like to learn?";
    
    if (message.toLowerCase().includes('course') || message.toLowerCase().includes('recommend')) {
      responseText = "🚀 I recommend starting with Python or JavaScript for beginners. These are great languages to begin your programming journey!";
    } else if (message.toLowerCase().includes('schedule') || message.toLowerCase().includes('plan')) {
      responseText = "📅 Here's a simple study plan: Study 1-2 hours daily, practice coding 30 minutes, and build small projects weekly!";
    } else if (message.toLowerCase().includes('programming')) {
      responseText = "💻 Programming is exciting! Start with basics, practice regularly, and build projects. Which language interests you most?";
    }
    
    res.json({
      success: true,
      response: responseText,
      message: {
        text: responseText,
        type: 'text'
      },
      aiPowered: true
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/chat', (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and session ID required' });
    }

    let responseText = "I'm here to help with your learning! What would you like to know?";
    
    res.json({
      success: true,
      message: {
        text: responseText,
        type: 'text'
      },
      sessionId: sessionId
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;