require('dotenv').config();
const { sendOtpEmail } = require('./services/emailService');

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ SMTP credentials not configured!');
    console.log('📝 Add these to your .env file:');
    console.log('   SMTP_HOST=smtp.gmail.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_USER=your-email@gmail.com');
    console.log('   SMTP_PASS=your-app-password');
    console.log('   FROM_EMAIL=your-email@gmail.com');
    return;
  }

  // Test sending OTP
  const testEmail = process.env.SMTP_USER; // Send to yourself for testing
  const testOtp = '123456';
  
  try {
    console.log(`📤 Sending test OTP to: ${testEmail}`);
    await sendOtpEmail(testEmail, testOtp);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox for the OTP email.');
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error Solutions:');
      console.log('   1. Enable 2-Factor Authentication on Gmail');
      console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('   3. Use App Password (not regular password) in SMTP_PASS');
      console.log('   4. Make sure Gmail account allows "Less secure apps" (not recommended)');
    }
  }
}

testEmail();
