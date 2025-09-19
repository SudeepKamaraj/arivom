const mongoose = require('mongoose');

const assessmentProgressSchema = new mongoose.Schema({
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
  answers: {
    type: [Number],
    default: []
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  timeLeft: {
    type: Number, // in seconds
    default: 1800 // 30 minutes
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['in_progress', 'paused', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
assessmentProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
assessmentProgressSchema.index({ lastUpdated: -1 });
assessmentProgressSchema.index({ status: 1 });

// Static method to get user's active assessments
assessmentProgressSchema.statics.getActiveAssessments = async function(userId) {
  return await this.find({ 
    userId, 
    status: { $in: ['in_progress', 'paused'] },
    lastUpdated: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  }).populate('courseId', 'title category level');
};

// Static method to clean up old progress
assessmentProgressSchema.statics.cleanupOldProgress = async function() {
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  return await this.deleteMany({
    lastUpdated: { $lt: cutoffDate },
    status: { $in: ['in_progress', 'paused'] }
  });
};

// Instance method to update progress
assessmentProgressSchema.methods.updateProgress = function(answers, currentQuestion, timeLeft) {
  this.answers = answers;
  this.currentQuestion = currentQuestion;
  this.timeLeft = timeLeft;
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to pause assessment
assessmentProgressSchema.methods.pause = function() {
  this.status = 'paused';
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to resume assessment
assessmentProgressSchema.methods.resume = function() {
  this.status = 'in_progress';
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to complete assessment
assessmentProgressSchema.methods.complete = function() {
  this.status = 'completed';
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to abandon assessment
assessmentProgressSchema.methods.abandon = function() {
  this.status = 'abandoned';
  this.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('AssessmentProgress', assessmentProgressSchema);
