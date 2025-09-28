// Test script for chatbot functionality
// Run this to verify the chatbot integration works correctly

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'chatbot_tester',
  email: 'test@chatbot.com',
  password: 'testpassword123'
};

let authToken = '';
let sessionId = `test_${Date.now()}`;

async function runChatbotTests() {
  console.log('🤖 Starting Chatbot Integration Tests...\n');

  try {
    // 1. Test user authentication
    console.log('1. Testing user authentication...');
    await testAuthentication();
    
    // 2. Test basic chat functionality
    console.log('2. Testing basic chat messaging...');
    await testBasicChat();
    
    // 3. Test course recommendations
    console.log('3. Testing course recommendations...');
    await testCourseRecommendations();
    
    // 4. Test study schedule generation
    console.log('4. Testing study schedule generation...');
    await testStudySchedule();
    
    // 5. Test progress tracking
    console.log('5. Testing progress tracking...');
    await testProgressTracking();
    
    // 6. Test chat history
    console.log('6. Testing chat history...');
    await testChatHistory();
    
    console.log('\n✅ All chatbot tests completed successfully!');
    console.log('\n🎉 Your chatbot is ready to help users!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Check your backend server and database connection.');
  }
}

async function testAuthentication() {
  try {
    // Try to login first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = loginResponse.data.token;
    console.log('   ✅ User login successful');
    
  } catch (error) {
    // If login fails, try to register
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      console.log('   ✅ User registration successful');
    } catch (regError) {
      throw new Error('Authentication failed: ' + regError.message);
    }
  }
}

async function testBasicChat() {
  try {
    const response = await axios.post(
      `${API_BASE}/chat/chat`,
      {
        message: 'Hello, I need help with learning',
        sessionId: sessionId,
        type: 'text'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success && response.data.message) {
      console.log('   ✅ Basic chat messaging works');
      console.log(`   📝 Bot response: "${response.data.message.text.substring(0, 50)}..."`);
    } else {
      throw new Error('Invalid chat response');
    }
    
  } catch (error) {
    throw new Error('Basic chat test failed: ' + error.message);
  }
}

async function testCourseRecommendations() {
  try {
    const response = await axios.post(
      `${API_BASE}/chat/chat`,
      {
        message: 'Please recommend some courses for me',
        sessionId: sessionId,
        type: 'text'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success) {
      console.log('   ✅ Course recommendation system works');
      
      // Also test direct recommendations endpoint
      const recResponse = await axios.post(
        `${API_BASE}/chat/recommendations`,
        { preferences: {}, context: 'test' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (recResponse.data.success) {
        console.log(`   📚 Found ${recResponse.data.recommendations?.length || 0} course recommendations`);
      }
    } else {
      throw new Error('Invalid recommendation response');
    }
    
  } catch (error) {
    throw new Error('Course recommendation test failed: ' + error.message);
  }
}

async function testStudySchedule() {
  try {
    const response = await axios.post(
      `${API_BASE}/chat/study-schedule`,
      {
        courseIds: [],
        availableHours: 10,
        preferences: { preferredTimes: 'evenings' }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success && response.data.schedule) {
      console.log('   ✅ Study schedule generation works');
      console.log(`   📅 Generated ${response.data.schedule.length} day schedule`);
    } else {
      throw new Error('Invalid schedule response');
    }
    
  } catch (error) {
    throw new Error('Study schedule test failed: ' + error.message);
  }
}

async function testProgressTracking() {
  try {
    const response = await axios.get(
      `${API_BASE}/chat/progress`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success && response.data.progress) {
      console.log('   ✅ Progress tracking works');
      console.log(`   📊 User has ${response.data.progress.overview.enrolledCourses} enrolled courses`);
    } else {
      throw new Error('Invalid progress response');
    }
    
  } catch (error) {
    throw new Error('Progress tracking test failed: ' + error.message);
  }
}

async function testChatHistory() {
  try {
    const response = await axios.get(
      `${API_BASE}/chat/history/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.messages) {
      console.log('   ✅ Chat history storage works');
      console.log(`   💬 Found ${response.data.messages.length} messages in history`);
    } else {
      throw new Error('Invalid history response');
    }
    
  } catch (error) {
    throw new Error('Chat history test failed: ' + error.message);
  }
}

// Additional utility functions for testing
async function testWithDifferentQueries() {
  const queries = [
    'What courses do you recommend for a beginner?',
    'Help me create a study plan',
    'Show me my learning progress',
    'I want to learn JavaScript',
    'What should I study next?'
  ];
  
  console.log('\n🧪 Testing various user queries...\n');
  
  for (const query of queries) {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/chat`,
        {
          message: query,
          sessionId: `test_queries_${Date.now()}`,
          type: 'text'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log(`Query: "${query}"`);
      console.log(`Response: "${response.data.message?.text?.substring(0, 100)}..."\n`);
      
    } catch (error) {
      console.log(`Query failed: "${query}" - ${error.message}\n`);
    }
  }
}

// Run tests
if (require.main === module) {
  runChatbotTests()
    .then(() => {
      console.log('\n🚀 Ready to test more queries? Uncomment testWithDifferentQueries() below!');
      // Uncomment to test various queries:
      // return testWithDifferentQueries();
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runChatbotTests,
  testWithDifferentQueries
};