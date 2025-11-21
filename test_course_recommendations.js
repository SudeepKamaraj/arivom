const axios = require('axios');

async function testCourseRecommendations() {
    console.log('🧪 Testing Course Recommendations with Real Course Data...\n');

    try {
        console.log('Testing course recommendation endpoint...');
        
        // Test with the test endpoint that should now show actual courses
        const response = await axios.post('http://localhost:5001/api/chat/test', {
            message: "recommend courses for me"
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Success! Course recommendation response received');
        console.log('Status:', response.status);
        console.log('Response type:', response.data.message.type);
        
        const responseText = response.data.message.text;
        console.log('\n📋 Response preview:');
        console.log('='.repeat(80));
        console.log(responseText.substring(0, 500) + '...');
        console.log('='.repeat(80));
        
        // Check if it contains actual course details
        const hasActualCourses = 
            responseText.includes('Python Programming') ||
            responseText.includes('Java Programming') ||
            responseText.includes('Web Development') ||
            responseText.includes('HTML') ||
            responseText.includes('React') ||
            responseText.includes('₹') ||
            responseText.includes('🆓 Free') ||
            responseText.includes('students enrolled');
            
        if (hasActualCourses) {
            console.log('\n🎉 SUCCESS: Response contains actual course details!');
            console.log('✅ Real courses are now being displayed to users');
        } else {
            console.log('\n⚠️  Still showing generic courses');
            console.log('❌ Need to investigate further');
        }
        
        // Test with Python-specific request
        console.log('\n\n🔸 Testing Python-specific recommendations...');
        const pythonResponse = await axios.post('http://localhost:5001/api/chat/test', {
            message: "recommend python courses"
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const pythonText = pythonResponse.data.message.text;
        if (pythonText.includes('Python Programming') || pythonText.includes('python')) {
            console.log('✅ Python-specific recommendations working!');
        } else {
            console.log('⚠️  Python recommendations not specific enough');
        }
        
    } catch (error) {
        console.log('❌ Error testing course recommendations:');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data || error.message);
    }
}

testCourseRecommendations();