const axios = require('axios');

async function testAuthenticatedEndpoint() {
    console.log('🧪 Testing Authenticated Chat Endpoint (Gemini)...\n');

    // Simulate an authenticated request
    // Note: Using a fake token for testing - in real app this would be a valid JWT
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token';

    try {
        console.log('Testing /api/chat/gemini-chat endpoint...');
        const response = await axios.post('http://localhost:5001/api/chat/gemini-chat', {
            message: "What are the trending programming topics?",
            sessionId: "test_session_123",
            requestType: "general"
        }, {
            timeout: 10000,
            headers: {
                'Authorization': `Bearer ${fakeToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Success! Gemini endpoint responded');
        console.log('Status:', response.status);
        console.log('Response preview:', response.data.message?.text?.substring(0, 150) + '...');
        
        // Test if intelligent response is working
        if (response.data.message?.text?.includes('🔥') || 
            response.data.message?.text?.includes('Python') || 
            response.data.message?.text?.includes('trending')) {
            console.log('🎉 Intelligent response detected!');
        } else {
            console.log('⚠️  Still getting generic response');
        }
        
    } catch (error) {
        console.log('❌ Error testing gemini endpoint:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('💡 This is expected - authentication failed with fake token');
            console.log('💡 But this confirms the endpoint exists and is accessible');
        }
    }
}

testAuthenticatedEndpoint();