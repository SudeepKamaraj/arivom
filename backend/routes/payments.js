const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');

const router = express.Router();

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials not configured properly');
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    // Check if Razorpay is properly configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        message: 'Payment system not configured. Please contact administrator.' 
      });
    }

    const { courseId } = req.body;
    const userId = req.user._id;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is free
    if (course.price === 0) {
      return res.status(400).json({ message: 'This course is free' });
    }

    // Check if user already paid for this course
    const existingPayment = await Payment.findOne({
      userId: userId,
      courseId: courseId,
      status: 'paid'
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'You have already purchased this course' });
    }

    // Check if user is already enrolled (for free courses)
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === userId.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: course.price * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: userId.toString(),
        courseName: course.title
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create payment record in database
    const payment = new Payment({
      orderId: `ORDER_${Date.now()}_${userId}`,
      userId: userId,
      courseId: courseId,
      amount: course.price,
      currency: 'INR',
      status: 'created',
      razorpayOrderId: razorpayOrder.id,
      metadata: {
        courseName: course.title,
        courseLevel: course.level,
        courseCategory: course.category
      }
    });

    await payment.save();

    // Return order details to frontend
    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      name: 'Course Purchase',
      description: `Purchase ${course.title}`,
      image: course.thumbnail || '/default-logo.png',
      prefill: {
        name: req.user.firstName + ' ' + req.user.lastName,
        email: req.user.email,
        contact: req.user.phone || ''
      },
      theme: {
        color: '#3B82F6'
      },
      notes: {
        courseId: courseId,
        userId: userId.toString()
      }
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId
    } = req.body;

    const userId = req.user._id;

    // Find the payment record
    const payment = await Payment.findOne({
      userId: userId,
      courseId: courseId,
      razorpayOrderId: razorpay_order_id
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Verify the payment signature
    const isValidPayment = payment.verifyPayment(razorpay_payment_id, razorpay_signature);
    
    if (isValidPayment) {
      await payment.save();

      // Enroll user in the course
      const course = await Course.findById(courseId);
      if (course) {
        const existingEnrollment = course.enrolledStudents.find(
          student => student.student.toString() === userId.toString()
        );

        if (!existingEnrollment) {
          course.enrolledStudents.push({
            student: userId,
            enrolledAt: new Date(),
            progress: 0,
            completedVideos: [],
            completedAssessments: [],
            certificateEarned: false
          });
          await course.save();
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });

    } else {
      await payment.save();
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const payments = await Payment.getUserPayments(userId, page, limit);

    res.json({
      payments,
      page,
      limit,
      total: await Payment.countDocuments({ userId: userId })
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

// Get payment status for a specific course
router.get('/status/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    let course = null;
    
    // Check if courseId is a valid ObjectId (24 characters, hexadecimal)
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(courseId) && courseId.length === 24) {
      // Try to find course by ID first
      course = await Course.findById(courseId);
    }
    
    if (!course) {
      // If not found by ID, try to find by matching title-based slug
      const courses = await Course.find();
      course = courses.find(c => {
        const courseSlug = c.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return courseSlug === courseId;
      });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is free
    if (course.price === 0) {
      // Check enrollment for free courses
      const isEnrolled = course.enrolledStudents.some(
        student => student.student.toString() === userId.toString()
      );
      
      return res.json({
        isFree: true,
        isEnrolled: isEnrolled,
        hasPaid: false,
        canAccess: isEnrolled
      });
    }

    // For paid courses, check payment status
    const payment = await Payment.findOne({
      userId: userId,
      courseId: course._id, // Use actual course ObjectId for payment lookup
      status: 'paid'
    });

    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === userId.toString()
    );

    res.json({
      isFree: false,
      isEnrolled: isEnrolled,
      hasPaid: !!payment,
      canAccess: !!payment && isEnrolled,
      paymentDetails: payment ? {
        paymentId: payment.razorpayPaymentId,
        paidAt: payment.paidAt,
        amount: payment.amount
      } : null
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

// Handle payment failure
router.post('/payment-failed', auth, async (req, res) => {
  try {
    const { razorpay_order_id, error } = req.body;
    const userId = req.user._id;

    // Find and update payment record
    const payment = await Payment.findOne({
      userId: userId,
      razorpayOrderId: razorpay_order_id
    });

    if (payment) {
      await payment.markAsFailed(error.description || 'Payment failed');
    }

    res.json({ message: 'Payment failure recorded' });

  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({ message: 'Failed to record payment failure' });
  }
});

// Admin: Get course payment statistics
router.get('/admin/course-stats/:courseId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { courseId } = req.params;
    const stats = await Payment.getCoursePaymentStats(courseId);

    res.json(stats);

  } catch (error) {
    console.error('Error fetching course payment stats:', error);
    res.status(500).json({ message: 'Failed to fetch payment statistics' });
  }
});

// Admin: Get all payments with filters
router.get('/admin/all-payments', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('courseId', 'title category price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// Test payment endpoint for development
router.post('/test-payment', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is free
    if (course.price === 0) {
      return res.status(400).json({ message: 'This course is free' });
    }

    // Check if user already paid for this course
    const existingPayment = await Payment.findOne({
      userId: userId,
      courseId: courseId,
      status: 'paid'
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'You have already purchased this course' });
    }

    // Create test payment record
    const payment = new Payment({
      orderId: `TEST_ORDER_${Date.now()}_${userId}`,
      userId: userId,
      courseId: courseId,
      amount: course.price,
      currency: 'INR',
      status: 'paid',
      razorpayOrderId: `test_order_${Date.now()}`,
      razorpayPaymentId: `test_payment_${Date.now()}`,
      razorpaySignature: `test_signature_${Date.now()}`,
      paidAt: new Date(), // Add paidAt timestamp
      paymentMethod: 'test',
      metadata: {
        courseName: course.title,
        courseLevel: course.level,
        courseCategory: course.category
      }
    });

    await payment.save();

    // Enroll user in course
    const isAlreadyEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === userId.toString()
    );

    if (!isAlreadyEnrolled) {
      course.enrolledStudents.push({
        student: userId,
        enrolledAt: new Date(),
        progress: 0
      });
      course.studentsCount = course.enrolledStudents.length;
      await course.save();
    }

    // Update user's enrolled courses
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Test payment successful! Course enrolled.',
      paymentId: payment.razorpayPaymentId
    });

  } catch (error) {
    console.error('Error processing test payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Test payment failed' 
    });
  }
});

// Webhook endpoint for Razorpay payment updates
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.get('X-Razorpay-Signature');
    const webhookBody = req.body;

    // Verify webhook signature if secret is configured
    if (webhookSecret && webhookSecret !== 'whsec_placeholder') {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody, 'utf8')
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const event = JSON.parse(webhookBody);
    console.log('Received webhook event:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions for webhook event handling
async function handlePaymentCaptured(paymentData) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentData.order_id
    });

    if (payment && payment.status !== 'paid') {
      payment.razorpayPaymentId = paymentData.id;
      payment.status = 'paid';
      payment.paidAt = new Date(paymentData.created_at * 1000);
      await payment.save();

      // Enroll user in course if not already enrolled
      const course = await Course.findById(payment.courseId);
      if (course) {
        const isEnrolled = course.enrolledStudents.some(
          student => student.student.toString() === payment.userId.toString()
        );

        if (!isEnrolled) {
          course.enrolledStudents.push({
            student: payment.userId,
            enrolledAt: new Date(),
            progress: 0
          });
          await course.save();
        }
      }

      console.log('Payment captured and user enrolled:', payment.razorpayPaymentId);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(paymentData) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentData.order_id
    });

    if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentData.error_description || 'Payment failed';
      await payment.save();
      console.log('Payment failed:', payment.razorpayOrderId);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(orderData) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: orderData.id
    });

    if (payment && payment.status !== 'paid') {
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
      console.log('Order paid:', payment.razorpayOrderId);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

module.exports = router;