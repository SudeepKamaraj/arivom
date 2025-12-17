const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'creator'],
      default: 'member'
    }
  }],
  maxMembers: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  schedule: {
    type: String,
    enum: ['flexible', 'daily', 'weekly', 'bi-weekly'],
    default: 'flexible'
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
studyGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
studyGroupSchema.index({ topic: 1, category: 1, level: 1 });
studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('StudyGroup', studyGroupSchema);