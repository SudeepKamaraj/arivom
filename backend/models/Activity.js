const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'course_view',
      'course_enroll',
      'course_complete',
      'video_watch',
      'assessment_take',
      'assessment_complete',
      'certificate_earned',
      'profile_update',
      'password_change',
      'search_query',
      'download_content',
      'share_content',
      'comment_post',
      'rating_given',
      'review_post',
      'review_update',
      'review_delete',
      'review_helpful'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

// Static method to log activity
activitySchema.statics.logActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    return await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Static method to get user activities
activitySchema.statics.getUserActivities = async function(userId, limit = 50, skip = 0) {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get activities by type
activitySchema.statics.getActivitiesByType = async function(type, limit = 50, skip = 0) {
  return await this.find({ type })
    .populate('userId', 'username firstName lastName')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Activity', activitySchema);
