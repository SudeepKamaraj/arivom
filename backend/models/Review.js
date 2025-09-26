const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    enum: ['inappropriate', 'spam', 'fake', 'other'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ user: 1, course: 1 }, { unique: true }); // One review per user per course
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerified: 1 });

// Static method to get course reviews
reviewSchema.statics.getCourseReviews = async function(courseId, page = 1, limit = 10, sortBy = 'createdAt') {
  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = -1;

  return await this.find({ course: courseId })
    .populate('user', 'username firstName lastName profilePicture')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Static method to get user reviews
reviewSchema.statics.getUserReviews = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  return await this.find({ user: userId })
    .populate('course', 'title thumbnail category level')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to calculate course rating
reviewSchema.statics.calculateCourseRating = async function(courseId) {
  const result = await this.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const { averageRating, totalReviews, ratingDistribution } = result[0];
  
  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    average: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    count: totalReviews,
    distribution
  };
};

// Static method to check if user can review course
reviewSchema.statics.canUserReview = async function(userId, courseId) {
  // Check if user has already reviewed this course
  const existingReview = await this.findOne({ user: userId, course: courseId });
  if (existingReview) {
    return { canReview: false, reason: 'already_reviewed' };
  }

  // Check if user has completed the course
  const Course = mongoose.model('Course');
  const course = await Course.findById(courseId);
  if (!course) {
    return { canReview: false, reason: 'course_not_found' };
  }

  const enrollment = course.enrolledStudents.find(
    student => student.student.toString() === userId.toString()
  );

  if (!enrollment) {
    return { canReview: false, reason: 'not_enrolled' };
  }

  // For testing purposes, allow reviews if user is enrolled and has progress > 50
  // In production, you might want to require certificate earned
  if (enrollment.progress < 50) {
    return { canReview: false, reason: 'course_not_completed' };
  }

  return { canReview: true };
};

// Instance method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  if (this.helpful.users.includes(userId)) {
    // Remove from helpful
    this.helpful.users = this.helpful.users.filter(id => id.toString() !== userId.toString());
    this.helpful.count = Math.max(0, this.helpful.count - 1);
  } else {
    // Add to helpful
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
  
  return await this.save();
};

// Post-save middleware to update course rating
reviewSchema.post('save', async function() {
  try {
    const Course = mongoose.model('Course');
    const ratingData = await this.constructor.calculateCourseRating(this.course);
    
    await Course.findByIdAndUpdate(this.course, {
      'rating.average': ratingData.average,
      'rating.count': ratingData.count
    });
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
});

// Post-remove middleware to update course rating when review is deleted
reviewSchema.post('remove', async function() {
  try {
    const Course = mongoose.model('Course');
    const ratingData = await this.constructor.calculateCourseRating(this.course);
    
    await Course.findByIdAndUpdate(this.course, {
      'rating.average': ratingData.average,
      'rating.count': ratingData.count
    });
  } catch (error) {
    console.error('Error updating course rating after review deletion:', error);
  }
});

// Post-findOneAndDelete middleware to update course rating when review is deleted via findByIdAndDelete
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Course = mongoose.model('Course');
      const Review = mongoose.model('Review');
      const ratingData = await Review.calculateCourseRating(doc.course);
      
      await Course.findByIdAndUpdate(doc.course, {
        'rating.average': ratingData.average,
        'rating.count': ratingData.count
      });
    } catch (error) {
      console.error('Error updating course rating after review deletion:', error);
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);
