const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials are not configured. Logging OTP for development:', otp);
    return;
  }
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  await transporter.sendMail({
    from,
    to,
    subject: 'Your OTP Code',
    html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px;">${otp}</h2><p>This code expires in 10 minutes.</p>`,
  });
}

module.exports = { sendOtpEmail };