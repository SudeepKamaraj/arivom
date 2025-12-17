// Authentication Debug Tool
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function debugAuth() {
  console.log('🔍 Debugging Authentication Issues...\n');
  
  try {
    // Step 1: Test server health
    console.log('1. Testing server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is healthy:', health.data.status);
    
    // Step 2: Test user registration/login
    console.log('\n2. Testing user authentication...');
    const testUser = {
      email: 'debug2@test.com',
      password: 'Password123!',
      username: 'debuguser2',
      firstName: 'Debug',
      lastName: 'User',
      skills: ['JavaScript', 'Node.js'],
      interests: 'Web development'
    };
    
    let authResponse;
    try {
      // Try login first
      authResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log('📝 User not found, registering...');
        authResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
        console.log('✅ Registration successful');
      } else {
        throw error;
      }
    }
    
    const token = authResponse.data.token;
    const user = authResponse.data.user || authResponse.data;
    
    console.log('📋 Auth Response:');
    console.log('- Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    console.log('- User ID:', user.id || user._id || 'MISSING');
    console.log('- Username:', user.username || 'MISSING');
    
    // Step 3: Test token validation
    console.log('\n3. Testing token validation...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Token validation successful');
      console.log('- Profile User ID:', profileResponse.data._id);
    } catch (error) {
      console.log('❌ Token validation failed:', error.response?.data?.message || error.message);
    }
    
    // Step 4: Test chat endpoint with authentication
    console.log('\n4. Testing authenticated chat endpoint...');
    try {
      const chatResponse = await axios.post(`${BASE_URL}/chat/chat`, {
        message: 'Hello, test message',
        sessionId: 'debug-session-123',
        type: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Authenticated chat works!');
      console.log('- Response:', chatResponse.data.message?.text?.substring(0, 100) || 'No text response');
    } catch (error) {
      console.log('❌ Authenticated chat failed:', error.response?.status, error.response?.data?.message || error.message);
      
      // Let's try the gemini chat endpoint
      console.log('\n   Trying Gemini chat endpoint...');
      try {
        const geminiResponse = await axios.post(`${BASE_URL}/chat/gemini-chat`, {
          message: 'Hello, test message',
          sessionId: 'debug-session-123',
          requestType: 'general'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Gemini chat works!');
        console.log('- AI Powered:', geminiResponse.data.aiPowered);
      } catch (geminiError) {
        console.log('❌ Gemini chat failed:', geminiError.response?.status, geminiError.response?.data?.message || geminiError.message);
      }
    }
    
    // Step 5: Test public chat endpoint
    console.log('\n5. Testing public chat endpoint...');
    try {
      const publicResponse = await axios.post(`${BASE_URL}/chat/public`, {
        message: 'Hello, public test'
      });
      console.log('✅ Public chat works!');
      console.log('- Response:', publicResponse.data.message?.substring(0, 100) || 'No response');
    } catch (error) {
      console.log('❌ Public chat failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DEBUGGING SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ If all tests passed, the backend is working correctly');
    console.log('❌ If chat failed, check the frontend authentication logic');
    console.log('\n💡 Frontend Debugging Tips:');
    console.log('1. Check localStorage for valid token:');
    console.log('   localStorage.getItem("token")');
    console.log('2. Verify the token is being sent in headers');
    console.log('3. Check if user is logged in before using chat');
    console.log('4. Consider using public chat for unauthenticated users');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugAuth();