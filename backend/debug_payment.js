const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001';

async function debugPaymentTest() {
  try {
    console.log('🔍 Debugging Payment Test...\n');
    
    // Test 1: Check server health
    console.log('1. Testing server health...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server healthy:', health.data.status);
    
    // Test 2: Try to create order without auth (should fail with 401)
    console.log('\n2. Testing payment endpoint without auth...');
    try {
      await axios.post(`${BASE_URL}/api/payments/create-order`, {
        courseId: 'test-id'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Payment endpoint requires auth (as expected)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 3: Create user and get token
    console.log('\n3. Creating test user...');
    let userToken;
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        firstName: 'Debug',
        lastName: 'User',
        email: 'debug@test.com',
        password: 'debug123',
        username: 'debuguser'
      });
      userToken = registerResponse.data.token;
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 400) {
        // Try login instead
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'debug@test.com',
          password: 'debug123'
        });
        userToken = loginResponse.data.token;
        console.log('✅ User logged in successfully');
      } else {
        throw error;
      }
    }
    
    // Test 4: Get courses
    console.log('\n4. Getting available courses...');
    const coursesResponse = await axios.get(`${BASE_URL}/api/courses`);
    const paidCourse = coursesResponse.data.find(course => course.price > 0);
    
    if (paidCourse) {
      console.log(`✅ Found paid course: ${paidCourse.title} (₹${paidCourse.price})`);
      
      // Test 5: Try payment order creation
      console.log('\n5. Testing payment order creation...');
      try {
        const orderResponse = await axios.post(`${BASE_URL}/api/payments/create-order`, {
          courseId: paidCourse._id
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        console.log('✅ Payment order created successfully!');
        console.log('Order details:', {
          orderId: orderResponse.data.orderId,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency
        });
      } catch (error) {
        console.log('❌ Payment order creation failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
      }
    } else {
      console.log('❌ No paid courses found');
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

debugPaymentTest();