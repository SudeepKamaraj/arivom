require('dotenv').config();

console.log('🔍 Environment Variables Debug:\n');

console.log('📋 SMTP Configuration:');
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);
console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);

console.log('\n📋 Other Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`   PORT: ${process.env.PORT || 'NOT SET'}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '***SET***' : 'NOT SET'}`);

console.log('\n🔧 Testing Email Service:');
const { sendOtpEmail } = require('./services/emailService');

async function testOtp() {
  try {
    await sendOtpEmail('sudeeepk07@gmail.com', '123456');
    console.log('✅ Email service test completed');
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
}

testOtp();
