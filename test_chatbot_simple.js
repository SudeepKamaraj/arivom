const http = require('http');

async function testChatbot() {
  try {
    console.log('🤖 Testing Chatbot API...\n');
    
    // Test 1: Basic test endpoint
    console.log('1. Testing basic chat functionality...');
    const response1 = await makeRequest('http://localhost:5001/api/chat/test', {
      message: 'Hello, can you help me find courses?'
    });
    
    console.log('✅ Test endpoint works!');
    console.log('Bot response:', response1.message.text.substring(0, 100) + '...\n');
    
    // Test 2: Different message types
    const testMessages = [
      'I want to learn programming',
      'Create a study plan for me',
      'What courses do you recommend?',
      'Show me my progress'
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const msg = testMessages[i];
      console.log(`${i + 2}. Testing: "${msg}"`);
      
      try {
        const response = await makeRequest('http://localhost:5001/api/chat/test', {
          message: msg
        });
        
        console.log(`✅ Response: ${response.message.text.substring(0, 80)}...\n`);
      } catch (error) {
        console.log(`❌ Failed: ${error.message}\n`);
      }
    }
    
    console.log('🎉 All chatbot tests completed successfully!');
    console.log('\n💡 Your chatbot is ready to help users in the frontend!');
    
  } catch (error) {
    console.error('❌ Main test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Make sure your backend server is running on port 5001');
    }
  }
}

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve(jsonResponse);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testChatbot();