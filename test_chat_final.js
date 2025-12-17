const axios = require('axios');

async function testChatEndpoints() {
    console.log('🧪 Testing Chat Endpoints...\n');
    
    try {
        // Test public chat
        console.log('1. Testing public chat endpoint...');
        const publicResponse = await axios.post('http://localhost:5001/api/chat/public', {
            message: 'Hello, I need help with learning programming'
        }, { timeout: 15000 });
        
        console.log('✅ Public Chat Response:');
        console.log('Status:', publicResponse.status);
        console.log('Data:', JSON.stringify(publicResponse.data, null, 2));
        console.log();
        
    } catch (error) {
        console.log('❌ Public Chat Error:');
        console.log('Code:', error.code);
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('Message:', error.message);
        console.log();
    }
    
    try {
        // Test teacher chat
        console.log('2. Testing teacher chat endpoint...');
        const teacherResponse = await axios.post('http://localhost:5001/api/chat/teacher', {
            message: 'I want to learn JavaScript, can you help me create a study plan?'
        }, { timeout: 15000 });
        
        console.log('✅ Teacher Chat Response:');
        console.log('Status:', teacherResponse.status);
        console.log('Data:', JSON.stringify(teacherResponse.data, null, 2));
        console.log();
        
    } catch (error) {
        console.log('❌ Teacher Chat Error:');
        console.log('Code:', error.code);
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('Message:', error.message);
        console.log();
    }
    
    console.log('🏁 Chat endpoint testing completed!');
}

testChatEndpoints();