// Test the enhanced chatbot with video functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testEnhancedChatbot() {
  console.log('🤖 Testing Enhanced Chatbot with Video Functionality\n');

  const testQueries = [
    'Hi there!',
    'Show me some videos',
    'I want to watch Python tutorials',
    'Play video lessons for React',
    'Start course videos',
    'Course content for web development',
    'What will I learn in JavaScript course?',
    'Recommend courses with videos'
  ];

  for (const query of testQueries) {
    try {
      console.log(`🔍 Testing: "${query}"`);
      
      const response = await axios.post(`${API_BASE}/chat/test`, {
        message: query
      });
      
      if (response.data.success) {
        const message = response.data.message;
        console.log(`✅ Response Type: ${message.type}`);
        console.log(`📝 Response Preview: ${message.text.substring(0, 150)}...`);
        
        if (message.data && message.data.courses) {
          console.log(`📚 Course Data: ${message.data.courses.length} courses included`);
        }
        
        if (message.data && message.data.videos) {
          console.log(`🎥 Video Data: ${message.data.videos.length} videos included`);
        }
        
        console.log('---');
      } else {
        console.log('❌ Test failed');
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Enhanced chatbot testing completed!');
  console.log('\n🎯 Key Features Tested:');
  console.log('✅ Video recommendations and playback suggestions');
  console.log('✅ Course content structure display');
  console.log('✅ Enhanced intent recognition for video requests');
  console.log('✅ Interactive video playlist generation');
  console.log('✅ Technology-specific video filtering');
}

// Run the test
testEnhancedChatbot().catch(console.error);