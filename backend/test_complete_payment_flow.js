const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001';

console.log('🚀 Testing Complete Payment Flow...\n');

// Test user credentials
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testpayment@example.com',
  password: 'testpass123',
  username: 'testpayment'
};

let userToken = '';
let userId = '';
let testCourseId = '';

async function completePaymentTest() {
  try {
    console.log('1️⃣ Creating test user...');
    await createTestUser();
    
    console.log('2️⃣ Creating test course...');
    await createTestCourse();
    
    console.log('3️⃣ Testing payment order creation...');
    await testPaymentOrder();
    
    console.log('4️⃣ Testing payment status check...');
    await testPaymentStatus();
    
    console.log('5️⃣ Simulating successful payment...');
    await simulatePayment();
    
    console.log('6️⃣ Verifying course enrollment...');
    await verifyEnrollment();
    
    console.log('\n🎉 Complete Payment Flow Test PASSED!');
    console.log('Your payment system is ready for frontend integration.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('Check server logs for more details.');
  }
}

async function createTestUser() {
  try {
    // Try to register new user
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    userToken = response.data.token;
    userId = response.data.user._id;
    console.log('✅ Test user created successfully');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      // User exists, try to login
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      userToken = loginResponse.data.token;
      userId = loginResponse.data.user._id;
      console.log('✅ Logged in with existing test user');
    } else {
      throw error;
    }
  }
}

async function createTestCourse() {
  try {
    const courseData = {
      title: 'Test Payment Course - Premium',
      description: 'A premium course for testing payment integration',
      price: 999, // ₹999
      category: 'Technology',
      level: 'Intermediate',
      duration: '3 hours',
      instructor: 'Payment Test Instructor',
      thumbnail: 'https://via.placeholder.com/300x200?text=Test+Course'
    };

    const response = await axios.post(`${BASE_URL}/api/courses`, courseData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    testCourseId = response.data._id;
    console.log(`✅ Test course created: ${response.data.title} (₹${response.data.price})`);
  } catch (error) {
    // If course creation fails, find an existing paid course
    const coursesResponse = await axios.get(`${BASE_URL}/api/courses`);
    const paidCourse = coursesResponse.data.find(course => course.price > 0);
    
    if (paidCourse) {
      testCourseId = paidCourse._id;
      console.log(`✅ Using existing course: ${paidCourse.title} (₹${paidCourse.price})`);
    } else {
      throw new Error('No paid courses available for testing');
    }
  }
}

async function testPaymentOrder() {
  const response = await axios.post(`${BASE_URL}/api/payments/create-order`, {
    courseId: testCourseId
  }, {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  const order = response.data;
  
  // Validate order structure
  if (!order.orderId || !order.amount || !order.key) {
    throw new Error('Invalid order response structure');
  }
  
  console.log('✅ Payment order created successfully');
  console.log(`   Order ID: ${order.orderId}`);
  console.log(`   Amount: ₹${order.amount / 100}`);
  console.log(`   Razorpay Key: ${order.key.substring(0, 15)}...`);
  
  return order;
}

async function testPaymentStatus() {
  const response = await axios.get(`${BASE_URL}/api/payments/status/${testCourseId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  const status = response.data;
  console.log('✅ Payment status retrieved');
  console.log(`   Course is free: ${status.isFree}`);
  console.log(`   User has paid: ${status.hasPaid}`);
  console.log(`   User is enrolled: ${status.isEnrolled}`);
  console.log(`   Can access: ${status.canAccess}`);
  
  return status;
}

async function simulatePayment() {
  // Use the test payment endpoint to simulate a successful payment
  const response = await axios.post(`${BASE_URL}/api/payments/test-payment`, {
    courseId: testCourseId
  }, {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  if (response.data.success) {
    console.log('✅ Payment simulation successful');
    console.log(`   Payment ID: ${response.data.paymentId}`);
  } else {
    throw new Error('Payment simulation failed');
  }
}

async function verifyEnrollment() {
  // Check if user is now enrolled in the course
  const response = await axios.get(`${BASE_URL}/api/payments/status/${testCourseId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  const status = response.data;
  
  if (status.hasPaid && status.isEnrolled && status.canAccess) {
    console.log('✅ Course enrollment verified');
    console.log('   User can now access the course content');
  } else {
    throw new Error('Course enrollment verification failed');
  }
  
  // Check payment history
  const historyResponse = await axios.get(`${BASE_URL}/api/payments/history`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  
  console.log(`✅ Payment history updated (${historyResponse.data.total} payments)`);
}

// Run the complete test
completePaymentTest();