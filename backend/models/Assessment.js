const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
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
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  answers: {
    type: [Number],
    required: true
  },
  questions: [{
    question: String,
    selectedAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean
  }],
  completedAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'incomplete'],
    default: 'incomplete'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
assessmentSchema.index({ userId: 1, completedAt: -1 });
assessmentSchema.index({ courseId: 1, completedAt: -1 });
assessmentSchema.index({ status: 1 });
assessmentSchema.index({ score: -1 });

// Static method to get user assessment statistics
assessmentSchema.statics.getUserStats = async function(userId) {
  const assessments = await this.find({ userId });
  
  return {
    totalAssessments: assessments.length,
    passedAssessments: assessments.filter(a => a.passed).length,
    failedAssessments: assessments.filter(a => !a.passed).length,
    averageScore: assessments.length > 0 
      ? assessments.reduce((sum, assessment) => sum + assessment.score, 0) / assessments.length 
      : 0,
    totalTimeSpent: assessments.reduce((sum, assessment) => sum + assessment.timeTaken, 0),
    assessmentsByMonth: assessments.reduce((acc, assessment) => {
      const month = new Date(assessment.completedAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {})
  };
};

// Static method to get course assessment statistics
assessmentSchema.statics.getCourseStats = async function(courseId) {
  const assessments = await this.find({ courseId });
  
  return {
    totalAssessments: assessments.length,
    passedAssessments: assessments.filter(a => a.passed).length,
    failedAssessments: assessments.filter(a => !a.passed).length,
    averageScore: assessments.length > 0 
      ? assessments.reduce((sum, assessment) => sum + assessment.score, 0) / assessments.length 
      : 0,
    averageTimeSpent: assessments.length > 0
      ? assessments.reduce((sum, assessment) => sum + assessment.timeTaken, 0) / assessments.length
      : 0,
    passRate: assessments.length > 0 
      ? (assessments.filter(a => a.passed).length / assessments.length) * 100 
      : 0
  };
};

module.exports = mongoose.model('Assessment', assessmentSchema);
