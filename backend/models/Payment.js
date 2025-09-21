const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'created'
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  refundId: {
    type: String,
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  paidAt: {
    type: Date,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Static method to check if user has paid for course
paymentSchema.statics.hasUserPaidForCourse = async function(userId, courseId) {
  const payment = await this.findOne({
    userId: userId,
    courseId: courseId,
    status: 'paid'
  });
  return !!payment;
};

// Static method to get user's payment history
paymentSchema.statics.getUserPayments = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return await this.find({ userId: userId })
    .populate('courseId', 'title thumbnail instructor category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get course payment statistics
paymentSchema.statics.getCoursePaymentStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const result = {
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    totalRevenue: 0
  };

  stats.forEach(stat => {
    result.totalPayments += stat.count;
    if (stat._id === 'paid') {
      result.successfulPayments = stat.count;
      result.totalRevenue = stat.totalAmount;
    } else if (stat._id === 'failed') {
      result.failedPayments = stat.count;
    }
  });

  return result;
};

// Instance method to verify payment
paymentSchema.methods.verifyPayment = function(razorpayPaymentId, razorpaySignature) {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(this.razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');

  if (expectedSignature === razorpaySignature) {
    this.razorpayPaymentId = razorpayPaymentId;
    this.razorpaySignature = razorpaySignature;
    this.status = 'paid';
    this.paidAt = new Date();
    return true;
  }
  
  this.status = 'failed';
  this.failureReason = 'Invalid signature';
  return false;
};

// Instance method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(refundAmount = null) {
  this.status = 'refunded';
  this.refundAmount = refundAmount || this.amount;
  this.refundedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);