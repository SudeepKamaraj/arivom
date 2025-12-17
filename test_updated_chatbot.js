const axios = require('axios');

async function testUpdatedChatbot() {
    console.log('🧪 Testing Updated Chatbot with Intelligent Responses...\n');

    const API_URL = 'http://localhost:5001/api/chat';
    
    // Test cases that should now work
    const testCases = [
        {
            name: "Trending Programming Topics",
            message: "What are the trending programming topics?",
            expected: "should mention Python, JavaScript, Cloud Computing, AI"
        },
        {
            name: "Python Query", 
            message: "python",
            expected: "should mention Data Science, Machine Learning, Django"
        },
        {
            name: "Programming General",
            message: "programming",
            expected: "should mention different languages and career opportunities"
        }
    ];

    for (const testCase of testCases) {
        console.log(`🔸 Testing: ${testCase.name}`);
        console.log(`   Message: "${testCase.message}"`);
        
        try {
            // Test with public endpoint (no auth)
            const response = await axios.post(`${API_URL}/chat/public`, {
                message: testCase.message
            }, { timeout: 10000 });
            
            console.log('   ✅ Response received!');
            console.log('   📤 Response preview:', response.data.response.substring(0, 120) + '...');
            
            // Check if it contains expected content
            const hasExpectedContent = 
                response.data.response.includes('Python') || 
                response.data.response.includes('JavaScript') ||
                response.data.response.includes('trending') ||
                response.data.response.includes('popular') ||
                response.data.response.includes('🔥') ||
                response.data.response.includes('🚀');
                
            if (hasExpectedContent) {
                console.log('   🎉 Contains intelligent content!');
            } else {
                console.log('   ⚠️  Still showing generic response');
            }
            
        } catch (error) {
            console.log('   ❌ Error:', error.response?.status || error.message);
            
            // Fallback: Test with authenticated endpoint simulation
            try {
                console.log('   🔄 Trying test endpoint...');
                const testResponse = await axios.post(`${API_URL}/test`, {
                    message: testCase.message
                }, { timeout: 10000 });
                
                console.log('   ✅ Test endpoint response:');
                console.log('   📤 Preview:', testResponse.data.message.text.substring(0, 120) + '...');
                
            } catch (testError) {
                console.log('   ❌ Test endpoint also failed:', testError.message);
            }
        }
        
        console.log(''); // Empty line for spacing
    }
    
    console.log('🏁 Test completed! Check if intelligent responses are working.');
}

testUpdatedChatbot().catch(console.error);