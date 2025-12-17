const axios = require('axios');

async function quickTest() {
    try {
        console.log('Testing basic connectivity...');
        const response = await axios.get('http://localhost:5001/api/health');
        console.log('Health check success:', response.data);
        
        console.log('\nTesting chat test endpoint...');
        const chatResponse = await axios.post('http://localhost:5001/api/chat/test', {
            message: "What are the trending programming topics?"
        }, {
            timeout: 5000
        });
        
        console.log('✅ Chat test successful!');
        console.log('Response:', chatResponse.data.message.text.substring(0, 200) + '...');
        console.log('Type:', chatResponse.data.message.type);
        
    } catch (error) {
        console.log('❌ Test failed:', error.code, error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

quickTest();