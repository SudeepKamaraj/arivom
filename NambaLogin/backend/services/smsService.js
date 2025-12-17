let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (e) {
    console.warn('Twilio package not installed; SMS disabled.');
  }
}

async function sendOtpSms(toPhone, otp) {
  if (!twilioClient || !process.env.TWILIO_FROM_NUMBER) {
    console.warn('Twilio is not configured. Logging OTP for development:', otp);
    return;
  }
  await twilioClient.messages.create({
    body: `Your verification code is ${otp}. It expires in 10 minutes.`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: toPhone,
  });
}

module.exports = { sendOtpSms };