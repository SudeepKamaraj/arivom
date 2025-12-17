const axios = require('axios');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

// Test configuration
let authToken = '';
let testCourseId = '';
let testUserId = '';

console.log('🧪 Starting Payment Integration Tests...\n');

async function runPaymentTests() {
  try {
    // Step 1: Test Razorpay Configuration
    await testRazorpayConfig();
    
    // Step 2: Create/Login Test User
    await setupTestUser();
    
    // Step 3: Create Test Course
    await createTestCourse();
    
    // Step 4: Test Payment Order Creation
    await testCreatePaymentOrder();
    
    // Step 5: Test Payment Status Check
    await testPaymentStatus();
    
    // Step 6: Test Payment History
    await testPaymentHistory();
    
    console.log('✅ All payment integration tests passed!\n');
    
  } catch (error) {
    console.error('❌ Payment integration test failed:', error.message);
    process.exit(1);
  }
}

async function testRazorpayConfig() {
  console.log('1️⃣ Testing Razorpay Configuration...');
  
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured in .env file');
  }
  
  if (keyId === 'rzp_test_placeholder' || keySecret === 'test_placeholder_secret_key') {
    throw new Error('Razorpay keys are still placeholder values');
  }
  
  if (!keyId.startsWith('rzp_test_')) {
    throw new Error('Razorpay Key ID should start with rzp_test_ for test mode');
  }
  
  console.log('✅ Razorpay configuration is valid');
  console.log(`   Key ID: ${keyId.substring(0, 15)}...`);
  console.log('');
}

async function setupTestUser() {
  console.log('2️⃣ Setting up test user...');
  
  try {
    // Try to register a new user
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      role: 'student'
    });
    
    authToken = registerResponse.data.token;
    testUserId = registerResponse.data.user._id;
    console.log('✅ New test user created and logged in');
    
  } catch (error) {
    // If user already exists, try to login
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      });
      
      authToken = loginResponse.data.token;
      testUserId = loginResponse.data.user._id;
      console.log('✅ Existing test user logged in');
      
    } catch (loginError) {
      throw new Error('Failed to create or login test user');
    }
  }
  
  console.log(`   User ID: ${testUserId}`);
  console.log('');
}

async function createTestCourse() {
  console.log('3️⃣ Creating test course...');
  
  try {
    const courseResponse = await axios.post(`${BASE_URL}/api/courses`, {
      title: 'Test Payment Course',
      description: 'A test course for payment integration testing',
      price: 999, // ₹999
      category: 'Programming',
      level: 'Beginner',
      duration: '2 hours',
      instructor: 'Test Instructor',
      thumbnail: 'https://example.com/thumbnail.jpg'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    testCourseId = courseResponse.data._id;
    console.log('✅ Test course created');
    console.log(`   Course ID: ${testCourseId}`);
    console.log(`   Price: ₹${courseResponse.data.price}`);
    
  } catch (error) {
    // If course creation fails, try to find an existing paid course
    try {
      const coursesResponse = await axios.get(`${BASE_URL}/api/courses`);
      const paidCourse = coursesResponse.data.find(course => course.price > 0);
      
      if (paidCourse) {
        testCourseId = paidCourse._id;
        console.log('✅ Using existing paid course for testing');
        console.log(`   Course ID: ${testCourseId}`);
        console.log(`   Price: ₹${paidCourse.price}`);
      } else {
        throw new Error('No paid courses available for testing');
      }
    } catch (findError) {
      throw new Error('Failed to create or find a test course');
    }
  }
  
  console.log('');
}

async function testCreatePaymentOrder() {
  console.log('4️⃣ Testing payment order creation...');
  
  try {
    const orderResponse = await axios.post(`${BASE_URL}/api/payments/create-order`, {
      courseId: testCourseId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const orderData = orderResponse.data;
    
    // Validate order response
    if (!orderData.orderId || !orderData.amount || !orderData.key) {
      throw new Error('Invalid order response structure');
    }
    
    if (orderData.key !== process.env.RAZORPAY_KEY_ID) {
      throw new Error('Order contains wrong Razorpay key');
    }
    
    console.log('✅ Payment order created successfully');
    console.log(`   Order ID: ${orderData.orderId}`);
    console.log(`   Amount: ₹${orderData.amount / 100}`);
    console.log(`   Currency: ${orderData.currency}`);
    
  } catch (error) {
    console.error('❌ Payment order creation failed:', error.response?.data || error.message);
    throw error;
  }
  
  console.log('');
}

async function testPaymentStatus() {
  console.log('5️⃣ Testing payment status check...');
  
  try {
    const statusResponse = await axios.get(`${BASE_URL}/api/payments/status/${testCourseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const statusData = statusResponse.data;
    
    console.log('✅ Payment status retrieved successfully');
    console.log(`   Is Free: ${statusData.isFree}`);
    console.log(`   Has Paid: ${statusData.hasPaid}`);
    console.log(`   Is Enrolled: ${statusData.isEnrolled}`);
    console.log(`   Can Access: ${statusData.canAccess}`);
    
  } catch (error) {
    console.error('❌ Payment status check failed:', error.response?.data || error.message);
    throw error;
  }
  
  console.log('');
}

async function testPaymentHistory() {
  console.log('6️⃣ Testing payment history...');
  
  try {
    const historyResponse = await axios.get(`${BASE_URL}/api/payments/history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const historyData = historyResponse.data;
    
    console.log('✅ Payment history retrieved successfully');
    console.log(`   Total Payments: ${historyData.total}`);
    console.log(`   Current Page: ${historyData.page}`);
    console.log(`   Payments on Page: ${historyData.payments.length}`);
    
  } catch (error) {
    console.error('❌ Payment history check failed:', error.response?.data || error.message);
    throw error;
  }
  
  console.log('');
}

// Test server health
async function testServerHealth() {
  console.log('🏥 Testing server health...');
  
  try {
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is healthy');
    console.log(`   Environment: ${healthResponse.data.environment}`);
    console.log(`   Database: ${healthResponse.data.database}`);
  } catch (error) {
    throw new Error('Server health check failed');
  }
  
  console.log('');
}

// Run all tests
async function main() {
  try {
    await testServerHealth();
    await runPaymentTests();
    
    console.log('🎉 Payment integration is fully working!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test frontend payment flow with Razorpay checkout');
    console.log('2. Use test card numbers for payment testing');
    console.log('3. Monitor webhook events in Razorpay dashboard');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if backend server is running');
    console.log('2. Verify Razorpay keys are correct');
    console.log('3. Ensure MongoDB connection is working');
    console.log('4. Check server logs for detailed errors');
    process.exit(1);
  }
}

// Run the test suite
main();