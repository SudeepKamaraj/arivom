const axios = require('axios');

async function testChatEndpoints() {
    console.log('🔧 Testing Chat Endpoints...\n');

    const API_URL = 'http://localhost:5001/api';
    
    // Test 1: Public chat with "trending programming topics"
    try {
        console.log('1️⃣ Testing public chat with "trending programming topics"');
        const response1 = await axios.post(`${API_URL}/chat/public`, {
            message: "What are the trending programming topics?"
        });
        
        console.log('✅ Public chat response:');
        console.log('Response:', response1.data.response);
        console.log('Intent:', response1.data.intent);
        console.log('Type:', response1.data.type);
        console.log('\n' + '='.repeat(50) + '\n');
        
    } catch (error) {
        console.log('❌ Public chat failed:', error.response?.data || error.message);
    }

    // Test 2: Public chat with "python"
    try {
        console.log('2️⃣ Testing public chat with "python"');
        const response2 = await axios.post(`${API_URL}/chat/public`, {
            message: "python"
        });
        
        console.log('✅ Public chat response:');
        console.log('Response:', response2.data.response);
        console.log('Intent:', response2.data.intent);
        console.log('Type:', response2.data.type);
        console.log('\n' + '='.repeat(50) + '\n');
        
    } catch (error) {
        console.log('❌ Public chat failed:', error.response?.data || error.message);
    }

    // Test 3: Check if regular chat endpoint works better
    try {
        console.log('3️⃣ Testing regular chat endpoint (test mode)');
        const response3 = await axios.post(`${API_URL}/chat/test`, {
            message: "What are the trending programming topics?"
        });
        
        console.log('✅ Test chat response:');
        console.log('Response text:', response3.data.message.text);
        console.log('Response type:', response3.data.message.type);
        console.log('\n' + '='.repeat(50) + '\n');
        
    } catch (error) {
        console.log('❌ Test chat failed:', error.response?.data || error.message);
    }

    // Test 4: Check what happens with course recommendation intent
    try {
        console.log('4️⃣ Testing with explicit course recommendation request');
        const response4 = await axios.post(`${API_URL}/chat/test`, {
            message: "recommend python courses for me"
        });
        
        console.log('✅ Course recommendation response:');
        console.log('Response text:', response4.data.message.text);
        console.log('Response type:', response4.data.message.type);
        console.log('\n' + '='.repeat(50) + '\n');
        
    } catch (error) {
        console.log('❌ Course recommendation failed:', error.response?.data || error.message);
    }
}

testChatEndpoints().catch(console.error);