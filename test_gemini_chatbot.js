// Test script to verify Gemini AI chatbot integration
const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function testGeminiChatbot() {
  console.log('🚀 Testing Gemini AI Chatbot Integration...\n');
  
  try {
    // 1. Test Gemini AI Service directly
    console.log('1. Testing Gemini AI Service directly...');
    const GeminiAIService = require('./backend/services/geminiAI');
    
    try {
      const geminiService = new GeminiAIService();
      console.log('✅ Gemini AI service initialized successfully');
      
      // Test basic chat response
      const chatResponse = await geminiService.generateChatResponse(
        "Hello! Can you help me learn programming?",
        { name: "Test User", skills: ["javascript"], interests: ["web development"] }
      );
      
      if (chatResponse.success) {
        console.log('✅ Gemini AI chat response:', chatResponse.response.substring(0, 150) + '...');
      } else {
        console.log('❌ Gemini AI chat failed:', chatResponse.error);
      }
      
    } catch (error) {
      console.log('❌ Gemini AI service error:', error.message);
      return;
    }
    
    // 2. Start the backend server for API testing
    console.log('\n2. Testing backend server endpoints...');
    
    // Check if server is running
    try {
      const healthResponse = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
      console.log('✅ Backend server is running');
    } catch (error) {
      console.log('❌ Backend server not running. Please start it with: cd backend && npm start');
      console.log('   Skipping API endpoint tests...');
      return;
    }
    
    // 3. Test user authentication
    console.log('\n3. Testing user authentication...');
    let authToken;
    
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'gemini.chatbot@test.com',
        password: 'testpassword123'
      });
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
    } catch (error) {
      console.log('📝 Login failed, registering new user...');
      try {
        const registerResponse = await axios.post('http://localhost:5001/api/auth/register', {
          email: 'gemini.chatbot@test.com',
          password: 'testpassword123',
          username: 'geminichatbottest',
          firstName: 'Gemini',
          lastName: 'Chatbot'
        });
        authToken = registerResponse.data.token;
        console.log('✅ Registration successful');
      } catch (regError) {
        console.log('❌ Registration failed:', regError.response?.data?.message || regError.message);
        return;
      }
    }
    
    // 4. Test chatbot endpoints
    console.log('\n4. Testing chatbot functionality...');
    
    const testMessages = [
      "Hello! I'm new to programming. Can you help me?",
      "Recommend some programming courses for beginners",
      "What's the best way to learn web development?",
      "Can you create a study plan for me?"
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`\n   Testing message ${i + 1}: "${message}"`);
      
      try {
        const chatResponse = await axios.post('http://localhost:5001/api/chat/chat', {
          message: message,
          sessionId: 'gemini-test-session-' + Date.now()
        }, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 30000
        });
        
        if (chatResponse.data.success) {
          const botResponse = chatResponse.data.message.text;
          console.log(`   ✅ Bot response (${botResponse.length} chars): ${botResponse.substring(0, 100)}...`);
        } else {
          console.log('   ❌ Chat failed:', chatResponse.data.error);
        }
        
      } catch (error) {
        console.log('   ❌ Chat request failed:', error.response?.data?.error || error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 Gemini AI chatbot testing completed!');
    
  } catch (error) {
    console.error('❌ Test script error:', error.message);
  }
}

// Run the test
testGeminiChatbot().catch(console.error);