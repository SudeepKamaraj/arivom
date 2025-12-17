const nodemailer = require('nodemailer');

// Direct test with your credentials
const testEmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'sudeeepk07@gmail.com',
    pass: 'urjambzzqzihuzkp'
  },
  tls: {
    rejectUnauthorized: false
  }
};

async function testDirectEmail() {
  console.log('🧪 Testing direct email configuration...\n');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport(testEmailConfig);
    
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');
    
    // Send test email
    console.log('📤 Sending test OTP email...');
    const testOtp = '123456';
    
    const mailOptions = {
      from: '"Arivom Learning Platform" <sudeeepk07@gmail.com>',
      to: 'sudeeepk07@gmail.com', // Send to yourself for testing
      subject: 'Test OTP - Arivom Learning Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Test OTP Email</h2>
          <p>This is a test email to verify your SMTP configuration.</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 8px;">${testOtp}</h1>
          </div>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
        </div>
      `,
      text: `Test OTP: ${testOtp}. If you received this email, your SMTP configuration is working!`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Check your inbox at: sudeeepk07@gmail.com');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error - Possible Solutions:');
      console.log('   1. Verify App Password is correct: urjambzzqzihuzkp');
      console.log('   2. Check if 2FA is enabled on Gmail account');
      console.log('   3. Regenerate App Password if needed');
      console.log('   4. Make sure account allows app passwords');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 Network Error - Check internet connection');
    } else {
      console.log('\n🔍 Full error details:', error);
    }
  }
}

testDirectEmail();
