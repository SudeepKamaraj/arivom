const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials (replace with real ones)
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function testQuestionnaireSystem() {
  try {
    console.log('🔍 Testing Interactive Questionnaire System...\n');

    // 1. Login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Start questionnaire
    console.log('2. Starting questionnaire...');
    const questionnaireStart = await axios.post(`${BASE_URL}/chat/questionnaire/start`, {}, { headers });
    console.log('📝 Welcome Question:', questionnaireStart.data.questionnaire);
    console.log('Session Data:', questionnaireStart.data.sessionData);
    console.log('');

    // 3. Answer first question (experience level)
    console.log('3. Answering first question (Beginner with some HTML/CSS)...');
    const step1 = await axios.post(`${BASE_URL}/chat/questionnaire/step`, {
      step: 1,
      answers: {},
      currentAnswer: 'Beginner with some HTML and CSS knowledge'
    }, { headers });
    console.log('📝 Question 2:', step1.data.message);
    console.log('Session Data:', step1.data.sessionData);
    console.log('');

    // 4. Answer second question (goals)
    console.log('4. Answering second question (Want to learn full-stack web development)...');
    const step2 = await axios.post(`${BASE_URL}/chat/questionnaire/step`, {
      step: 2,
      answers: { q1: 'Beginner with some HTML and CSS knowledge' },
      currentAnswer: 'I want to become a full-stack web developer and build modern websites'
    }, { headers });
    console.log('📝 Question 3:', step2.data.message);
    console.log('Session Data:', step2.data.sessionData);
    console.log('');

    // 5. Answer third question (timeline)
    console.log('5. Answering third question (3-6 months timeline)...');
    const step3 = await axios.post(`${BASE_URL}/chat/questionnaire/step`, {
      step: 3,
      answers: { 
        q1: 'Beginner with some HTML and CSS knowledge',
        q2: 'I want to become a full-stack web developer and build modern websites'
      },
      currentAnswer: '3-6 months, I can dedicate 2-3 hours daily'
    }, { headers });
    
    console.log('🎯 Final Recommendations:');
    console.log('Message:', step3.data.message);
    console.log('Type:', step3.data.type);
    
    if (step3.data.videos) {
      console.log('\n📹 Recommended Videos:');
      step3.data.videos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.title}`);
        console.log(`   URL: ${video.url}`);
        console.log(`   Description: ${video.description}`);
      });
    }

    if (step3.data.courses) {
      console.log('\n📚 Recommended Courses:');
      step3.data.courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   Instructor: ${course.instructor}`);
        console.log(`   Duration: ${course.duration}`);
        console.log(`   Level: ${course.level}`);
      });
    }

    console.log('\n✅ Questionnaire system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Note: Please ensure you have a valid test user account or update the TEST_USER credentials.');
    }
  }
}

// Also test through chat endpoint
async function testQuestionnaireViaChat() {
  try {
    console.log('\n🔍 Testing Questionnaire via Chat Endpoint...\n');

    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Send questionnaire trigger message
    console.log('2. Sending questionnaire trigger message...');
    const chatResponse = await axios.post(`${BASE_URL}/chat/chat`, {
      message: 'I want to start learning programming, can you help me?',
      sessionId: 'test-session-' + Date.now()
    }, { headers });

    console.log('🤖 Bot Response:', chatResponse.data.message.text);
    console.log('Intent:', chatResponse.data.intent);
    console.log('Type:', chatResponse.data.message.type);

    if (chatResponse.data.message.videos) {
      console.log('\n📹 Videos included in response:');
      chatResponse.data.message.videos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.title} - ${video.url}`);
      });
    }

    console.log('\n✅ Chat questionnaire test completed!');

  } catch (error) {
    console.error('❌ Chat test failed:', error.response?.data || error.message);
  }
}

// Run tests
console.log('🚀 Starting Questionnaire System Tests...\n');

testQuestionnaireSystem()
  .then(() => testQuestionnaireViaChat())
  .then(() => {
    console.log('\n🎉 All tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });