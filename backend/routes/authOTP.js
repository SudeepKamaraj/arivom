const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Simple OTP generation function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Import the email service
const { sendOtpEmail, sendWelcomeEmail } = require('../services/emailService');

// Temporary storage for pending signups (in production, use Redis or database)
const pendingSignups = new Map();

// Request OTP for signup
router.post('/signup/request-otp', async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    const { name, lastName, email, phone, password, confirmPassword } = req.body;
    
    if (!name || !email || !password || !confirmPassword) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password, confirmPassword: !!confirmPassword });
      return res.status(400).json({ message: 'Name, email, password, and confirm password are required' });
    }
    
    if (password !== confirmPassword) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Basic password validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending signup data
    pendingSignups.set(email, {
      name: name.trim(),
      lastName: lastName?.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      password,
      otp,
      expires
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ 
      message: 'OTP sent to your email. Please verify to complete registration.',
      otpSent: true,
      email 
    });
  } catch (error) {
    console.error('Signup OTP request error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP for signup
router.post('/signup/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    const signupData = pendingSignups.get(email);
    if (!signupData) {
      return res.status(400).json({ message: 'OTP not requested or expired' });
    }

    if (new Date() > signupData.expires) {
      pendingSignups.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (signupData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Create user (password will be hashed by the pre-save hook)
    const user = new User({
      firstName: signupData.name,
      lastName: signupData.lastName || '',
      username: signupData.email.split('@')[0], // Generate username from email
      email: signupData.email,
      phone: signupData.phone,
      password: signupData.password, // Will be hashed by pre-save hook
      role: 'student',
      skills: [],
      interests: '',
      careerObjective: '',
      isActive: true,
      loginCount: 0,
      skillsSelected: false // Flag to indicate user needs to complete skills/interests selection
    });

    await user.save();
    pendingSignups.delete(email);

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.firstName).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        skillsSelected: user.skillsSelected
      }
    });
  } catch (error) {
    console.error('Signup OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// Enhanced login with OTP support
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update login count and last login
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
        skillsSelected: user.skillsSelected || false
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Request OTP for login (for additional security)
router.post('/login/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found for this email' });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in user document
    user.otpCode = otp;
    user.otpExpiresAt = expires;
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.json({ 
      message: 'OTP sent to your email',
      otpSent: true,
      email: user.email 
    });
  } catch (error) {
    console.error('Login OTP request error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP for login
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP not requested' });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP fields
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login verified',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
        skillsSelected: user.skillsSelected || false
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

module.exports = router;