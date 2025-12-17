const express = require('express');
const { signup, register, signupRequestOtp, signupVerifyOtp, login, loginRequestOtp, verifyOtp, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/register', register);
router.post('/signup/request-otp', signupRequestOtp);
router.post('/signup/verify-otp', signupVerifyOtp);
router.post('/login', login);
router.post('/login/request-otp', loginRequestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;