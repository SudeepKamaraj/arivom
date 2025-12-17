const axios = require('axios');

async function testRoutes() {
    console.log('🔧 Testing Available Routes...\n');

    const API_URL = 'http://localhost:5001/api/chat';
    
    // Test different route combinations
    const routes = [
        '/public',
        '/chat/public', 
        '/test'
    ];
    
    for (const route of routes) {
        try {
            console.log(`Testing route: ${API_URL}${route}`);
            const response = await axios.post(`${API_URL}${route}`, {
                message: "hello"
            });
            
            console.log(`✅ Route ${route} works!`);
            console.log('Response keys:', Object.keys(response.data));
            
        } catch (error) {
            console.log(`❌ Route ${route} failed:`, error.response?.status, error.response?.data?.message || error.message);
        }
        console.log('');
    }
}

testRoutes().catch(console.error);