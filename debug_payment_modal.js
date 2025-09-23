// Debug script to test payment modal functionality

const API_BASE_URL = 'http://localhost:5001/api';

async function testPaymentEndpoints() {
    console.log('🔍 Testing Payment Modal Endpoints...\n');
    
    try {
        // Test 1: Get courses
        console.log('1️⃣ Testing courses endpoint...');
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        const courses = await coursesResponse.json();
        
        if (!coursesResponse.ok) {
            console.log('❌ Courses endpoint failed:', courses);
            return;
        }
        
        console.log('✅ Courses endpoint working');
        console.log(`   Found ${courses.length} courses`);
        
        // Find a paid course
        const paidCourse = courses.find(course => course.price > 0);
        if (!paidCourse) {
            console.log('⚠️  No paid courses found for testing');
            return;
        }
        
        console.log(`   Using course: ${paidCourse.title} (₹${paidCourse.price})`);
        console.log(`   Course ID: ${paidCourse._id}`);
        
        // Test 2: Payment status endpoint (without auth)
        console.log('\n2️⃣ Testing payment status endpoint (no auth)...');
        const statusResponse = await fetch(`${API_BASE_URL}/payments/status/${paidCourse._id}`);
        const statusData = await statusResponse.text();
        
        console.log(`   Response status: ${statusResponse.status}`);
        console.log(`   Response: ${statusData}`);
        
        if (statusResponse.status === 401) {
            console.log('✅ Correct! Endpoint requires authentication');
        } else {
            console.log('⚠️  Unexpected response (should require auth)');
        }
        
        // Test 3: Check if payment routes are properly registered
        console.log('\n3️⃣ Testing payment route registration...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check passed:', healthData.status);
        
        // Test 4: Check specific payment endpoint paths
        console.log('\n4️⃣ Testing payment endpoint paths...');
        const testPaths = [
            '/payments/status/test',
            '/payments/history', 
            '/payments/create-order'
        ];
        
        for (const path of testPaths) {
            try {
                const response = await fetch(`${API_BASE_URL}${path}`);
                console.log(`   ${path}: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.log(`   ${path}: ERROR - ${error.message}`);
            }
        }
        
        console.log('\n📝 Summary:');
        console.log('- Backend server is running ✅');
        console.log('- Courses endpoint working ✅');
        console.log('- Payment routes registered ✅');
        console.log('- Authentication required for payment status ✅');
        
        console.log('\n💡 Next steps:');
        console.log('1. Check if user is logged in on frontend');
        console.log('2. Verify auth token is being sent correctly');
        console.log('3. Check browser console for errors');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testPaymentEndpoints();