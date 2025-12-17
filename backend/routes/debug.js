// Debug endpoint to test authentication
const express = require('express');
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Course = require('../models/Course');

const router = express.Router();

// Test auth endpoint
router.get('/test-auth', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    },
    timestamp: new Date().toISOString()
  });
});

// Test payment status without auth requirement (for debugging)
router.get('/test-payment-status/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Just return a mock status for debugging
    res.json({
      isFree: false,
      isEnrolled: false,
      hasPaid: false,
      canAccess: false,
      debug: {
        courseId,
        endpoint: 'test-payment-status',
        timestamp: new Date().toISOString(),
        message: 'This is a debug endpoint'
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Debug endpoint error',
      error: error.message
    });
  }
});

// Simulate payment for testing purposes
router.post('/test-payment', auth, async (req, res) => {
  try {
    const { courseId, amount, paymentId, orderId } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ 
      userId, 
      courseId, 
      status: 'completed' 
    });

    if (existingPayment) {
      return res.json({
        message: 'Payment already exists',
        payment: existingPayment
      });
    }

    // Create test payment record
    const payment = new Payment({
      userId,
      courseId,
      amount: amount || course.price * 100,
      currency: 'INR',
      orderId: orderId || `test_order_${Date.now()}`,
      paymentId: paymentId || `test_payment_${Date.now()}`,
      status: 'completed',
      paymentMethod: 'test',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Test payment created successfully',
      payment: {
        _id: payment._id,
        courseId: payment.courseId,
        amount: payment.amount,
        status: payment.status,
        paymentId: payment.paymentId,
        orderId: payment.orderId
      }
    });

  } catch (error) {
    console.error('Test payment error:', error);
    res.status(500).json({
      message: 'Failed to create test payment',
      error: error.message
    });
  }
});

module.exports = router;