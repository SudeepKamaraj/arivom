// Simple test to check chat endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testChatEndpoints() {
  console.log('🔍 Testing Chat Endpoints...\n');

  // Test 1: Public chat endpoint
  try {
    console.log('1. Testing public chat endpoint...');
    const response1 = await axios.post(`${BASE_URL}/chat/public`, {
      message: 'Hello'
    });
    console.log('✅ Public chat endpoint working');
    console.log('Response:', response1.data);
  } catch (error) {
    console.log('❌ Public chat endpoint failed');
    console.log('Error:', error.response?.status, error.response?.data || error.message);
  }

  console.log('');

  // Test 2: Authenticated chat endpoint (without token - should fail gracefully)
  try {
    console.log('2. Testing authenticated chat endpoint without token...');
    const response2 = await axios.post(`${BASE_URL}/chat/chat`, {
      message: 'Hello',
      sessionId: 'test-session'
    });
    console.log('✅ Authenticated chat endpoint working without token');
    console.log('Response:', response2.data);
  } catch (error) {
    console.log('❌ Authenticated chat endpoint failed without token');
    console.log('Error:', error.response?.status, error.response?.data || error.message);
  }

  console.log('');

  // Test 3: Check if server is responding at all
  try {
    console.log('3. Testing basic server health...');
    const response3 = await axios.get(`${BASE_URL}/health`).catch(() => {
      return axios.get('http://localhost:5001/');
    }).catch(() => {
      return axios.get('http://localhost:5001/api/');
    });
    console.log('✅ Server is responding');
  } catch (error) {
    console.log('❌ Server not responding');
    console.log('Error:', error.message);
  }

  console.log('');

  // Test 4: Check what endpoints are available
  try {
    console.log('4. Testing different endpoint variations...');
    
    // Try different possible endpoints
    const endpoints = [
      '/chat',
      '/chat/advanced', 
      '/chat/gemini-chat',
      '/advanced-chat'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.post(`${BASE_URL}${endpoint}`, {
          message: 'test'
        });
        console.log(`✅ ${endpoint} - Working`);
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.response?.status || 'Connection failed'}`);
      }
    }
  } catch (error) {
    console.log('❌ Endpoint testing failed');
  }
}

testChatEndpoints().then(() => {
  console.log('\n🔍 Test completed!');
}).catch(error => {
  console.error('💥 Test failed:', error.message);
});