const axios = require('axios');

async function testPublicEndpoint() {
    console.log('🧪 Testing Public Chat Endpoint After Fix...\n');

    try {
        console.log('Testing /api/chat/public endpoint...');
        const response = await axios.post('http://localhost:5001/api/chat/public', {
            message: "What are the trending programming topics?"
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Success! Public endpoint is working');
        console.log('Status:', response.status);
        console.log('Response preview:', response.data.response.substring(0, 150) + '...');
        
        // Test if intelligent response is working
        if (response.data.response.includes('🔥') || response.data.response.includes('Python') || response.data.response.includes('trending')) {
            console.log('🎉 Intelligent response detected!');
        } else {
            console.log('⚠️  Still getting generic response');
        }
        
    } catch (error) {
        console.log('❌ Error testing public endpoint:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
}

testPublicEndpoint();