const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { auth, logActivity } = require('../middleware/auth');

const router = express.Router();

// Check username/email availability
router.post('/check-availability', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      const conflicts = [];
      if (existingUser.email === email) conflicts.push('email');
      if (existingUser.username === username) conflicts.push('username');
      
      return res.status(200).json({ 
        available: false,
        conflicts,
        message: `${conflicts.join(' and ')} already taken`
      });
    }
    
    res.status(200).json({ 
      available: true,
      message: 'Username and email are available'
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: 'Server error checking availability' });
  }
});

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, skills, interests, careerObjective } = req.body;
    console.log('Register called');

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const conflicts = [];
      if (existingUser.email === email) conflicts.push('email');
      if (existingUser.username === username) conflicts.push('username');
      
      return res.status(400).json({ 
        message: `Registration failed: ${conflicts.join(' and ')} already exists.`,
        conflicts
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
      skills: skills || [],
      interests: interests || '',
      careerObjective: careerObjective || ''
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Log registration activity
    await Activity.logActivity({
      userId: user._id,
      type: 'profile_update',
      description: 'User registered successfully',
      metadata: { registrationMethod: 'email' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
        careerObjective: user.careerObjective
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Log login activity
    await Activity.logActivity({
      userId: user._id,
      type: 'login',
      description: 'User logged in successfully',
      metadata: { loginMethod: 'email' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// User Logout
router.post('/logout', auth, logActivity, (req, res) => {
  try {
    // Set activity data for logging
    req.activityData = {
      type: 'logout',
      description: 'User logged out successfully',
      metadata: { logoutMethod: 'api' }
    };

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout.' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Update user profile
router.put('/profile', auth, logActivity, async (req, res) => {
  try {
    const { firstName, lastName, profilePicture } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    // Set activity data for logging
    req.activityData = {
      type: 'profile_update',
      description: 'User profile updated successfully',
      metadata: { updatedFields: Object.keys(req.body) }
    };

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// Change password
router.put('/change-password', auth, logActivity, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Set activity data for logging
    req.activityData = {
      type: 'password_change',
      description: 'Password changed successfully',
      metadata: { changeMethod: 'api' }
    };

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password.' });
  }
});

module.exports = router;
