// Test authenticated chat with a sample token
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAuthenticatedChat() {
  console.log('🔐 Testing Authenticated Chat Flow...\n');

  try {
    // Step 1: Try to login to get a valid token
    console.log('1. Attempting to login...');
    
    // First, let's try a test login
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      console.log('✅ Login successful');
      
      const token = loginResponse.data.token;
      console.log('Token received:', token ? 'Yes' : 'No');

      // Step 2: Test authenticated chat with valid token
      console.log('\n2. Testing authenticated chat with valid token...');
      
      const chatResponse = await axios.post(`${BASE_URL}/chat/chat`, {
        message: 'I am a beginner interested in programming',
        sessionId: 'test-session-' + Date.now()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Authenticated chat working!');
      console.log('Response type:', chatResponse.data.message?.type);
      console.log('Response preview:', chatResponse.data.message?.text?.substring(0, 100) + '...');

    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.status, loginError.response?.data?.message || loginError.message);
      
      // Step 3: Try with a dummy token to see the specific error
      console.log('\n3. Testing with dummy token to see specific error...');
      
      try {
        const chatResponse = await axios.post(`${BASE_URL}/chat/chat`, {
          message: 'Hello',
          sessionId: 'test-session'
        }, {
          headers: {
            'Authorization': 'Bearer dummy-token',
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Unexpected success with dummy token');
      } catch (chatError) {
        console.log('❌ Chat error with dummy token:', chatError.response?.status);
        console.log('Error details:', chatError.response?.data);
        
        // Check if it's specifically a 500 error
        if (chatError.response?.status === 500) {
          console.log('\n🚨 Found the 500 error! This suggests an internal server error in the chat endpoint.');
          console.log('This could be due to:');
          console.log('- Database connection issues');
          console.log('- Error in our new teacher response functions');
          console.log('- Missing environment variables');
          console.log('- Issues with the GeminiAI service');
        }
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Also test if we can create a test user
async function createTestUser() {
  console.log('\n👤 Attempting to create test user...');
  
  try {
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Test user created or already exists');
    return true;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Test user already exists');
      return true;
    }
    console.log('❌ Failed to create test user:', error.response?.data?.message || error.message);
    return false;
  }
}

createTestUser().then(() => {
  return testAuthenticatedChat();
}).then(() => {
  console.log('\n🎯 Authentication test completed!');
});