// Direct Gemini AI test
const axios = require('axios');

async function quickTest() {
  try {
    console.log('🚀 Quick Gemini AI Test...');
    
    // Test health endpoint
    const health = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
    console.log('✅ Server health:', health.data.status);
    
    // Test basic authentication
    let token;
    try {
      const login = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'test@test.com',
        password: 'test123'
      }, { timeout: 5000 });
      token = login.data.token;
      console.log('✅ Login successful');
    } catch (e) {
      console.log('📝 Creating test user...');
      const register = await axios.post('http://localhost:5001/api/auth/register', {
        email: 'test@test.com',
        password: 'test123',
        username: 'testuser123',
        firstName: 'Test',
        lastName: 'User'
      }, { timeout: 10000 });
      token = register.data.token;
      console.log('✅ Registration successful');
    }
    
    // Test Gemini AI endpoint
    console.log('\n🤖 Testing Gemini AI...');
    const geminiTest = await axios.post('http://localhost:5001/api/chat/gemini-chat', {
      message: 'What programming courses do you recommend for a beginner?',
      sessionId: 'test-123',
      requestType: 'course-recommendation'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000
    });
    
    console.log('✅ Gemini Response:', geminiTest.data.message.text.substring(0, 200) + '...');
    console.log('🤖 AI Powered:', geminiTest.data.aiPowered);
    
  } catch (error) {
    console.error('❌ Error:', error.code || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

quickTest();