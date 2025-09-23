const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

console.log('🔍 Payment Issue Debugging Script\n');

async function debugPaymentIssue() {
  console.log('1️⃣ Checking Backend Server Connection...');
  try {
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Backend server is accessible');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Environment: ${healthResponse.data.environment}`);
  } catch (error) {
    console.log('❌ Backend server connection failed');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Solution: Make sure the backend server is running:');
    console.log('   cd "D:\\course recommendation system\\backend"');
    console.log('   node server.js');
    return;
  }

  console.log('\n2️⃣ Testing User Authentication...');
  let authToken = '';
  try {
    // Try to create/login a test user
    const testUser = {
      firstName: 'Debug',
      lastName: 'User', 
      email: 'debug@test.com',
      password: 'debug123',
      username: 'debuguser'
    };

    let userResponse;
    try {
      userResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Test user registered successfully');
    } catch (regError) {
      if (regError.response?.status === 400) {
        // User exists, try login
        userResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Test user logged in successfully');
      } else {
        throw regError;
      }
    }

    authToken = userResponse.data.token;
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
  } catch (error) {
    console.log('❌ User authentication failed');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return;
  }

  console.log('\n3️⃣ Testing Course Availability...');
  try {
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    const courses = coursesResponse.data;
    const paidCourse = courses.find(course => course.price > 0);
    
    if (paidCourse) {
      console.log('✅ Found paid course for testing');
      console.log(`   Course: ${paidCourse.title}`);
      console.log(`   Price: ₹${paidCourse.price}`);
      console.log(`   ID: ${paidCourse._id}`);

      console.log('\n4️⃣ Testing Payment Order Creation...');
      try {
        const orderResponse = await axios.post(`${BASE_URL}/payments/create-order`, {
          courseId: paidCourse._id
        }, {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Payment order created successfully');
        console.log(`   Order ID: ${orderResponse.data.orderId}`);
        console.log(`   Amount: ₹${orderResponse.data.amount / 100}`);
        console.log(`   Razorpay Key: ${orderResponse.data.key}`);

        console.log('\n5️⃣ Testing Payment Status Check...');
        try {
          const statusResponse = await axios.get(`${BASE_URL}/payments/status/${paidCourse._id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          console.log('✅ Payment status check successful');
          console.log(`   Has Paid: ${statusResponse.data.hasPaid}`);
          console.log(`   Is Enrolled: ${statusResponse.data.isEnrolled}`);
          console.log(`   Can Access: ${statusResponse.data.canAccess}`);

          console.log('\n6️⃣ Testing Test Payment (Development Mode)...');
          try {
            const testPaymentResponse = await axios.post(`${BASE_URL}/payments/test-payment`, {
              courseId: paidCourse._id
            }, {
              headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('✅ Test payment successful');
            console.log(`   Message: ${testPaymentResponse.data.message}`);

            // Check status again
            const finalStatusResponse = await axios.get(`${BASE_URL}/payments/status/${paidCourse._id}`, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            console.log('\n7️⃣ Final Payment Status...');
            console.log(`   Has Paid: ${finalStatusResponse.data.hasPaid}`);
            console.log(`   Is Enrolled: ${finalStatusResponse.data.isEnrolled}`);
            console.log(`   Can Access: ${finalStatusResponse.data.canAccess}`);

          } catch (testPaymentError) {
            console.log('❌ Test payment failed');
            console.log(`   Status: ${testPaymentError.response?.status}`);
            console.log(`   Error: ${testPaymentError.response?.data?.message || testPaymentError.message}`);
          }

        } catch (statusError) {
          console.log('❌ Payment status check failed');
          console.log(`   Status: ${statusError.response?.status}`);
          console.log(`   Error: ${statusError.response?.data?.message || statusError.message}`);
        }

      } catch (orderError) {
        console.log('❌ Payment order creation failed');
        console.log(`   Status: ${orderError.response?.status}`);
        console.log(`   Error: ${orderError.response?.data?.message || orderError.message}`);
        
        if (orderError.response?.status === 400) {
          console.log('\n💡 Common causes of 400 error:');
          console.log('   - User already purchased the course');
          console.log('   - Course is free (price = 0)');
          console.log('   - Invalid course ID');
        }
      }

    } else {
      console.log('❌ No paid courses found');
      console.log('   Create a course with price > 0 for testing');
    }

  } catch (coursesError) {
    console.log('❌ Failed to fetch courses');
    console.log(`   Error: ${coursesError.response?.data?.message || coursesError.message}`);
  }

  console.log('\n🎯 Summary & Solutions:');
  console.log('If payment button is not working in frontend:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Ensure user is logged in (check localStorage.authToken)');
  console.log('3. Verify the course has price > 0');
  console.log('4. Check if user already purchased the course');
  console.log('5. Make sure backend server is running on port 5001');
  console.log('6. Check CORS settings in backend server.js');
  console.log('\nTo test frontend:');
  console.log('1. Open browser developer tools (F12)');
  console.log('2. Click purchase button');
  console.log('3. Check Console tab for errors');
  console.log('4. Check Network tab for failed requests');
}

debugPaymentIssue().catch(error => {
  console.error('\n💥 Debug script failed:', error.message);
});