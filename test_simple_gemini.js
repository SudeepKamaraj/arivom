// Simple test for Gemini AI integration
const axios = require('axios');

async function testGeminiIntegration() {
  console.log('🚀 Testing Gemini AI Integration...\n');
  
  try {
    // Test server health first
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Server is healthy:', healthResponse.data);
    
    // Test user registration/login
    console.log('\n2. Testing user authentication...');
    let authToken;
    
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'gemini.test@example.com',
        password: 'password123'
      });
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
    } catch (error) {
      console.log('📝 Login failed, registering new user...');
      const registerResponse = await axios.post('http://localhost:5001/api/auth/register', {
        email: 'gemini.test@example.com',
        password: 'password123',
        username: 'geminitest',
        firstName: 'Gemini',
        lastName: 'Test'
      });
      authToken = registerResponse.data.token;
      console.log('✅ Registration successful');
    }
    
    // Test basic chat endpoint (fallback)
    console.log('\n3. Testing basic chat functionality...');
    const basicChatResponse = await axios.post('http://localhost:5001/api/chat/chat', {
      message: 'Hello',
      sessionId: 'test-session-123'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Basic chat working:', basicChatResponse.data.message.text.substring(0, 100) + '...');
    
    // Test Gemini AI chat
    console.log('\n4. Testing Gemini AI chat...');
    const geminiResponse = await axios.post('http://localhost:5001/api/chat/gemini-chat', {
      message: 'Recommend programming courses for a beginner',
      sessionId: 'test-session-123',
      requestType: 'course-recommendation'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Gemini AI Response:');
    console.log('🤖 AI Powered:', geminiResponse.data.aiPowered);
    console.log('📝 Response:', geminiResponse.data.message.text.substring(0, 200) + '...');
    
    // Test AI recommendations endpoint
    console.log('\n5. Testing AI recommendations endpoint...');
    const recommendationsResponse = await axios.get('http://localhost:5001/api/chat/ai-recommendations?query=learn web development', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ AI Recommendations:');
    console.log('🎯 Total Courses:', recommendationsResponse.data.totalCourses);
    console.log('🤖 AI Powered:', recommendationsResponse.data.aiPowered);
    console.log('📊 User Profile:', JSON.stringify(recommendationsResponse.data.userProfile, null, 2));
    
    console.log('\n🎉 All tests passed! Gemini AI integration is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testGeminiIntegration();