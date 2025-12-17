const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingSignup = require('../models/PendingSignup');
const { sendOtpEmail } = require('../services/emailService');
const { sendOtpSms } = require('../services/smsService');
const { generateOTP } = require('../services/otpService');

async function signup(req, res) {
  try {
    const { name, lastName, email, phone, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: 'Name, email, password, and confirmPassword are required' });

    const nameOk = /^[A-Za-z ]+$/.test(name.trim());
    if (!nameOk) return res.status(400).json({ message: 'Name must contain only alphabets and spaces' });

    const emailOk = /^[\w.+-]+@gmail\.com$/.test(email.trim());
    if (!emailOk) return res.status(400).json({ message: 'Email must be a valid Gmail address' });

    const passwordOk = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
    if (!passwordOk) return res.status(400).json({ message: 'Password must be 8+ chars with uppercase, number, special char' });

    if (phone && !/^\d{10}$/.test(String(phone))) return res.status(400).json({ message: 'Phone must be exactly 10 digits if provided' });

    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ message: 'Phone already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      ...(lastName ? { lastName: String(lastName).trim() } : {}),
      email: email.trim().toLowerCase(),
      password: hashed,
      ...(phone ? { phone: String(phone) } : {})
    });
    await user.save();

    res.json({ message: 'Signup successful! You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
}

async function register(req, res) {
  try {
    const { name, lastName, email, password, confirmPassword, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const finalConfirmPassword = confirmPassword || password;
    if (password !== finalConfirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const nameOk = /^[A-Za-z ]+$/.test(name.trim());
    if (!nameOk) return res.status(400).json({ message: 'Name must contain only alphabets and spaces' });

    const emailOk = /^[\w.+-]+@gmail\.com$/.test(email.trim());
    if (!emailOk) return res.status(400).json({ message: 'Email must be a valid Gmail address' });

    const passwordOk = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
    if (!passwordOk) return res.status(400).json({ message: 'Password must be 8+ chars with uppercase, number, special char' });

    if (phone && !/^\d{10}$/.test(String(phone))) return res.status(400).json({ message: 'Phone must be exactly 10 digits if provided' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ message: 'Phone already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name: name.trim(), email: email.trim().toLowerCase(), password: hashed, ...(phone ? { phone: String(phone) } : {}) });
    await user.save();

    res.json({ message: 'Registration successful! You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
}

async function signupRequestOtp(req, res) {
  try {
    const { name, lastName, email, phone, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) return res.status(400).json({ message: 'All fields are required' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    await PendingSignup.deleteOne({ email });
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await PendingSignup.create({ name, lastName, email, phone, password, otp, expires });
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent to your email. Please verify to complete registration.', otpSent: true, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
}

async function signupVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const signupData = await PendingSignup.findOne({ email });
    if (!signupData) return res.status(400).json({ message: 'OTP not requested or expired' });
    if (new Date() > signupData.expires) {
      await PendingSignup.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }
    if (String(signupData.otp) !== String(otp)) return res.status(400).json({ message: 'Invalid OTP' });

    const hashed = await bcrypt.hash(signupData.password, 10);
    const user = new User({
      name: signupData.name,
      ...(signupData.lastName ? { lastName: signupData.lastName } : {}),
      email: signupData.email,
      ...(signupData.phone ? { phone: signupData.phone } : {}),
      password: hashed,
      role: 'user',
      emailVerified: true
    });
    await user.save();
    await PendingSignup.deleteOne({ email });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    res.json({ message: 'Registration successful!', token, user: { name: user.name, email: user.email, role: user.role || 'user' } });
  } catch (err) {
    console.error('SignupVerifyOtp Error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
}


async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.emailVerified) return res.status(403).json({ message: 'Account not verified. Please verify OTP sent to your email.' });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email, role: user.role || 'user' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
}

async function loginRequestOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found for this email' });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpCode = otp;
    user.otpExpiresAt = expires;
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.json({ message: 'OTP sent to your email', otpSent: true, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiresAt) return res.status(400).json({ message: 'OTP not requested' });

    if (new Date() > new Date(user.otpExpiresAt)) return res.status(400).json({ message: 'OTP expired' });

    if (String(user.otpCode) !== String(otp)) return res.status(400).json({ message: 'Invalid OTP' });

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    user.emailVerified = true;
    await user.save();

    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    res.json({ message: 'Login verified', token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('LoginVerifyOtp Error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) return res.status(400).json({ message: 'Email or phone is required' });

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);
    if (!user) return res.status(200).json({ message: 'If the account exists, a reset code was sent' });

    const code = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetCode = code;
    user.resetExpiresAt = expires;
    await user.save();

    if (email) await sendOtpEmail(user.email, code);
    if (phone) await sendOtpSms(user.phone || phone, code);

    res.json({ message: 'Reset code sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send reset code' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, phone, code, newPassword, confirmPassword } = req.body;
    if ((!email && !phone) || !code || !newPassword || !confirmPassword) return res.status(400).json({ message: 'Email or phone, code and passwords are required' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);
    if (!user || !user.resetCode || !user.resetExpiresAt) return res.status(400).json({ message: 'Reset not requested' });
    if (new Date() > new Date(user.resetExpiresAt)) return res.status(400).json({ message: 'Reset code expired' });
    if (String(user.resetCode) !== String(code)) return res.status(400).json({ message: 'Invalid reset code' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
}

module.exports = {
  signup,
  register,
  signupRequestOtp,
  signupVerifyOtp,
  login,
  loginRequestOtp,
  verifyOtp,
  forgotPassword,
  resetPassword
};