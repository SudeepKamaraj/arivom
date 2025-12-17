const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Simple test chat endpoints
app.post('/api/chat/public', (req, res) => {
  try {
    const { message } = req.body;
    console.log('📝 Public chat message:', message);
    
    res.json({
      success: true,
      response: `Hello! You said: "${message}". This is a simple test response.`,
      intent: 'test',
      type: 'text'
    });
  } catch (error) {
    console.error('Public chat error:', error);
    res.status(500).json({ error: 'Test error in public chat' });
  }
});

app.post('/api/chat/teacher', (req, res) => {
  try {
    const { message } = req.body;
    console.log('🎓 Teacher chat message:', message);
    
    res.json({
      success: true,
      response: `Thank you for your message: "${message}". As your AI teacher, I'm here to help you learn! This is a simple test response.`,
      type: 'teacher'
    });
  } catch (error) {
    console.error('Teacher chat error:', error);
    res.status(500).json({ error: 'Test error in teacher chat' });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Simple test server running on port', PORT);
  console.log('📡 Health check: http://localhost:5001/api/health');
  console.log('💬 Public chat: http://localhost:5001/api/chat/public');
  console.log('🎓 Teacher chat: http://localhost:5001/api/chat/teacher');
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});