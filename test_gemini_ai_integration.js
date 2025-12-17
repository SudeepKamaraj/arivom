// Comprehensive test for Gemini AI Chat Integration
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
  firstName: 'John',
  lastName: 'Doe'
};

class GeminiChatTester {
  constructor() {
    this.authToken = null;
    this.sessionId = `test-session-${Date.now()}`;
  }

  async login() {
    try {
      console.log('🔐 Logging in test user...');
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      this.authToken = response.data.token;
      console.log('✅ Login successful');
      return true;
    } catch (error) {
      console.log('❌ Login failed, attempting to register...');
      return await this.register();
    }
  }

  async register() {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
      this.authToken = response.data.token;
      console.log('✅ Registration successful');
      return true;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testGeminiChatGeneral() {
    console.log('\n🤖 Testing Gemini AI General Chat...');
    
    try {
      const response = await axios.post(`${BASE_URL}/chat/gemini-chat`, {
        message: 'Hello! I want to learn programming but I\'m a complete beginner. Can you help me?',
        sessionId: this.sessionId,
        requestType: 'general'
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      console.log('✅ Gemini General Chat Response:');
      console.log(response.data.message.text);
      console.log(`🔧 AI Powered: ${response.data.aiPowered}`);
      console.log(`📝 Source: ${response.data.message.source}`);
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Gemini general chat failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testGeminiCourseRecommendations() {
    console.log('\n📚 Testing Gemini AI Course Recommendations...');
    
    try {
      const response = await axios.post(`${BASE_URL}/chat/gemini-chat`, {
        message: 'I want to become a web developer. I know basic HTML and CSS. What courses should I take next?',
        sessionId: this.sessionId,
        requestType: 'course-recommendation'
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      console.log('✅ Gemini Course Recommendations:');
      console.log(response.data.message.text);
      console.log(`🔧 AI Powered: ${response.data.aiPowered}`);
      console.log(`🎯 Request Type: ${response.data.requestType}`);
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Gemini course recommendations failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testAIRecommendationsEndpoint() {
    console.log('\n🎯 Testing AI Recommendations Endpoint...');
    
    try {
      const response = await axios.get(`${BASE_URL}/chat/ai-recommendations?query=I want to learn data science and machine learning`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      console.log('✅ AI Recommendations Endpoint Response:');
      console.log('📊 User Profile:', JSON.stringify(response.data.userProfile, null, 2));
      console.log('📚 Total Courses:', response.data.totalCourses);
      console.log('🤖 AI Powered:', response.data.aiPowered);
      console.log('\n🎯 Recommendations:');
      console.log(response.data.recommendations);
      
      return response.data.success;
    } catch (error) {
      console.error('❌ AI recommendations endpoint failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testProgressAnalysis() {
    console.log('\n📈 Testing Gemini AI Progress Analysis...');
    
    try {
      const response = await axios.post(`${BASE_URL}/chat/gemini-chat`, {
        message: 'Can you analyze my learning progress and suggest what I should focus on next?',
        sessionId: this.sessionId,
        requestType: 'progress-analysis'
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      console.log('✅ Gemini Progress Analysis:');
      console.log(response.data.message.text);
      console.log(`🔧 AI Powered: ${response.data.aiPowered}`);
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Gemini progress analysis failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testConversationFlow() {
    console.log('\n💬 Testing Conversation Flow...');
    
    const messages = [
      'Hi there!',
      'What programming languages do you recommend for beginners?',
      'I\'m interested in web development',
      'What about mobile app development?',
      'Can you create a learning plan for me?'
    ];

    let successCount = 0;

    for (let i = 0; i < messages.length; i++) {
      try {
        console.log(`\n${i + 1}. User: ${messages[i]}`);
        
        const response = await axios.post(`${BASE_URL}/chat/gemini-chat`, {
          message: messages[i],
          sessionId: this.sessionId,
          requestType: 'general'
        }, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        });

        console.log(`   Bot: ${response.data.message.text.substring(0, 150)}...`);
        
        if (response.data.success) successCount++;
        
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Message ${i + 1} failed:`, error.response?.data || error.message);
      }
    }

    console.log(`\n📊 Conversation Flow Results: ${successCount}/${messages.length} messages successful`);
    return successCount === messages.length;
  }

  async testFallbackBehavior() {
    console.log('\n🛟 Testing Fallback Behavior (intentionally causing error)...');
    
    try {
      // Test with invalid request type to trigger fallback
      const response = await axios.post(`${BASE_URL}/chat/gemini-chat`, {
        message: 'Test message',
        sessionId: this.sessionId,
        requestType: 'invalid-type'
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      console.log('✅ Fallback Response:');
      console.log(response.data.message.text);
      console.log(`🔧 AI Powered: ${response.data.aiPowered}`);
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Fallback test failed:', error.response?.data || error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Gemini AI Chat Integration Tests...\n');
    
    const authenticated = await this.login();
    if (!authenticated) {
      console.log('❌ Authentication failed. Cannot proceed with tests.');
      return;
    }

    const tests = [
      { name: 'Gemini General Chat', test: () => this.testGeminiChatGeneral() },
      { name: 'Course Recommendations', test: () => this.testGeminiCourseRecommendations() },
      { name: 'AI Recommendations Endpoint', test: () => this.testAIRecommendationsEndpoint() },
      { name: 'Progress Analysis', test: () => this.testProgressAnalysis() },
      { name: 'Conversation Flow', test: () => this.testConversationFlow() },
      { name: 'Fallback Behavior', test: () => this.testFallbackBehavior() }
    ];

    const results = [];

    for (const { name, test } of tests) {
      try {
        const result = await test();
        results.push({ name, success: result });
        
        if (result) {
          console.log(`\n✅ ${name}: PASSED`);
        } else {
          console.log(`\n❌ ${name}: FAILED`);
        }
        
        // Delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`\n❌ ${name}: ERROR -`, error.message);
        results.push({ name, success: false, error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 GEMINI AI CHAT INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} | ${result.name}`);
      if (result.error) {
        console.log(`       Error: ${result.error}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Overall Results: ${passed}/${total} tests passed`);
    console.log(`🎯 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Gemini AI integration is working perfectly!');
    } else {
      console.log('⚠️  Some tests failed. Check the logs above for details.');
    }
    
    console.log('\n🤖 Gemini AI Features Available:');
    console.log('• Intelligent course recommendations based on user profile');
    console.log('• Personalized learning path suggestions');
    console.log('• Progress analysis and feedback');
    console.log('• Natural conversation with context awareness');
    console.log('• Fallback behavior for reliability');
    console.log('\n📝 API Endpoints:');
    console.log('• POST /api/chat/gemini-chat - Enhanced AI chat');
    console.log('• GET /api/chat/ai-recommendations - Direct AI recommendations');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new GeminiChatTester();
  tester.runAllTests().catch(console.error);
}

module.exports = GeminiChatTester;