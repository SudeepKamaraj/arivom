const nodemailer = require('nodemailer');

// Create transporter with SMTP configuration
let transporter = null;

function createTransporter() {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured. Email service will use fallback mode.');
    return null;
  }

  console.log('🔧 Configuring SMTP with:');
  console.log(`   Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`   Port: ${process.env.SMTP_PORT || 587}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   Pass: ${process.env.SMTP_PASS ? '***configured***' : 'NOT SET'}`);

  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true, // Enable debug logs
    logger: true // Enable logger
  };

  return nodemailer.createTransport(config);
}

// Initialize transporter
transporter = createTransporter();

// Verify transporter configuration
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP configuration error:', error);
      console.error('📋 Common solutions:');
      console.error('   1. Check if 2FA is enabled on Gmail');
      console.error('   2. Generate App Password from Google Account settings');
      console.error('   3. Use App Password (not regular password) in SMTP_PASS');
      console.error('   4. Check if "Less secure app access" is enabled (not recommended)');
    } else {
      console.log('✅ SMTP server is ready to send emails');
    }
  });
} else {
  console.log('📧 Email service running in development mode (console logging)');
}

async function sendOtpEmail(to, otp) {
  try {
    // Check if SMTP credentials are configured
    if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP credentials not configured. Logging OTP for development:', otp);
      console.log(`📧 OTP for ${to}: ${otp}`);
      console.log('🔧 To enable email sending, add these to your .env file:');
      console.log('   SMTP_USER=your-email@gmail.com');
      console.log('   SMTP_PASS=your-app-password');
      return Promise.resolve();
    }

    console.log(`📤 Attempting to send OTP email to: ${to}`);
    console.log(`🔢 OTP: ${otp}`);

    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
    
    const mailOptions = {
      from: `"Arivom Learning Platform" <${from}>`,
      to: to,
      subject: 'Your OTP Verification Code - Arivom',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Arivom</h1>
              <p style="color: #6B7280; margin: 5px 0;">Learning Platform</p>
            </div>
            
            <h2 style="color: #1F2937; text-align: center; margin-bottom: 20px;">Email Verification</h2>
            
            <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Thank you for signing up with Arivom! To complete your registration, please use the verification code below:
            </p>
            
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
              This code will expire in <strong>10 minutes</strong> for security reasons.
            </p>
            
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 20px;">
              If you didn't request this code, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Arivom Learning Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Your Arivom verification code is: ${otp}. This code expires in 10 minutes.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📧 OTP sent to:', to);
    
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Fallback to console logging in case of email service failure
    console.log(`📧 Fallback - OTP for ${to}: ${otp}`);
    throw error;
  }
}

// Function to send welcome email after successful registration
async function sendWelcomeEmail(to, firstName) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`🎉 Welcome email would be sent to ${firstName} at ${to}`);
      return Promise.resolve();
    }

    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
    
    const mailOptions = {
      from: `"Arivom Learning Platform" <${from}>`,
      to: to,
      subject: 'Welcome to Arivom - Your Learning Journey Begins!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Arivom</h1>
              <p style="color: #6B7280; margin: 5px 0;">Learning Platform</p>
            </div>
            
            <h2 style="color: #1F2937; text-align: center; margin-bottom: 20px;">Welcome, ${firstName}! 🎉</h2>
            
            <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Congratulations on successfully joining Arivom! We're excited to have you as part of our learning community.
            </p>
            
            <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4F46E5; margin-top: 0;">What's Next?</h3>
              <ul style="color: #4B5563; line-height: 1.6;">
                <li>Explore our course catalog</li>
                <li>Set up your learning goals</li>
                <li>Connect with fellow learners</li>
                <li>Start your first course</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
              Happy learning!<br>
              The Arivom Team
            </p>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Arivom Learning Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `Welcome to Arivom, ${firstName}! Your account has been successfully created. Visit your dashboard to start learning.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email failure
    return null;
  }
}

module.exports = { 
  sendOtpEmail,
  sendWelcomeEmail
};