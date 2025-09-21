const mongoose = require('mongoose');

// Define the UserAchievement schema
const UserAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  notified: {
    type: Boolean,
    default: false
  }
});

// Create a compound index to ensure a user can't earn the same achievement twice
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// Add method to mark achievement as completed
UserAchievementSchema.methods.complete = function() {
  this.isCompleted = true;
  this.progress = 100;
  return this.save();
};

// Create and export the UserAchievement model
const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

module.exports = UserAchievement;