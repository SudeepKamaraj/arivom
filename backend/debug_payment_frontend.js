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

        console.log('\n🎯 PAYMENT SYSTEM IS WORKING CORRECTLY!');
        console.log('\n💡 Frontend Issue Troubleshooting:');
        console.log('1. Check browser console for JavaScript errors');
        console.log('2. Verify user is logged in (localStorage.authToken exists)');
        console.log('3. Check if CORS is blocking requests');
        console.log('4. Ensure frontend is calling the correct API endpoints');

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
}

debugPaymentIssue().catch(error => {
  console.error('\n💥 Debug script failed:', error.message);
});