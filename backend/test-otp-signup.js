const axios = require('axios');

async function testOtpSignup() {
  console.log('🧪 Testing OTP signup process...\n');
  
  const baseURL = 'http://localhost:5001';
  
  const testUser = {
    name: 'Test',
    lastName: 'User',
    email: 'sudeeepk07@gmail.com', // Using your email for testing
    phone: '1234567890',
    password: 'Test@123',
    confirmPassword: 'Test@123'
  };

  try {
    console.log('📤 Requesting OTP for signup...');
    console.log(`📧 Email: ${testUser.email}`);
    
    const response = await axios.post(`${baseURL}/api/auth/signup/request-otp`, testUser);
    
    console.log('✅ OTP request successful!');
    console.log('📋 Response:', response.data);
    console.log('\n📧 Check your email inbox for the OTP!');
    console.log('🔢 If email is working, you should receive an OTP at:', testUser.email);
    
  } catch (error) {
    console.error('❌ OTP request failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Server connection error - make sure server is running on port 5001');
    }
  }
}

testOtpSignup();
