const express = require('express');
const router = express.Router();

// Add CORS headers for preflight requests
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

router.post('/test', (req, res) => {
  console.log('TEST endpoint hit!');
  res.json({ message: 'Test endpoint working!' });
});

router.post('/public', (req, res) => {
  console.log('PUBLIC endpoint hit!');
  res.json({ success: true, response: 'Public chat working!' });
});

router.post('/chat', (req, res) => {
  console.log('CHAT endpoint hit!', req.body);
  res.json({ 
    success: true, 
    message: {
      text: 'Hello! This is a basic chat response. The teacher chatbot is temporarily simplified.',
      type: 'text'
    }
  });
});

module.exports = router;