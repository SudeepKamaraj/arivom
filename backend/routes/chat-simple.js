const express = require('express');
const router = express.Router();

// Simple test route to verify the chat module works
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Chat routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Health check for chat system
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Chat API',
    version: '1.0.0'
  });
});

module.exports = router;