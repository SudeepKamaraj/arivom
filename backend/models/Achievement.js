const mongoose = require('mongoose');

// Define the Achievement schema
const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['course', 'assessment', 'streak', 'community', 'special'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['course_count', 'assessment_score', 'daily_streak', 'review_count', 'video_count', 'perfect_score', 'speed_run', 'explorer', 'social_learner'],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    domainSpecific: {
      enabled: {
        type: Boolean,
        default: false
      },
      domain: String
    },
    timeLimit: {
      type: Number, // in hours
      default: null
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    }]
  },
  xpReward: {
    type: Number,
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  estimatedTime: {
    type: String,
    default: null // e.g., "2 hours", "1 week"
  },
  isChained: {
    type: Boolean,
    default: false
  },
  chainedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    default: null
  },
  tags: [{
    type: String
  }],
  seasonalEvent: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    eventName: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
AchievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for achievement URL
AchievementSchema.virtual('url').get(function() {
  return `/achievements/${this._id}`;
});

// Create and export the Achievement model
const Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;