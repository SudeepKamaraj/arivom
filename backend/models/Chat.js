const mongoose = require('mongoose');

// Message schema for individual chat messages
const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['text', 'course-recommendation', 'study-plan', 'quick-action', 'progress-report'],
    default: 'text'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

// Chat session schema
const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSessionSchema.index({ userId: 1, sessionId: 1 });
chatSessionSchema.index({ lastActivity: -1 });
chatSessionSchema.index({ isActive: 1 });

// Methods
chatSessionSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastActivity = new Date();
  return this.save();
};

chatSessionSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Static methods
chatSessionSchema.statics.findActiveSession = function(userId, sessionId) {
  return this.findOne({ userId, sessionId, isActive: true });
};

chatSessionSchema.statics.createSession = function(userId, sessionId) {
  return this.create({
    userId,
    sessionId,
    messages: [],
    isActive: true,
    lastActivity: new Date()
  });
};

// Cleanup old inactive sessions (optional background task)
chatSessionSchema.statics.cleanupOldSessions = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    lastActivity: { $lt: cutoffDate },
    isActive: false
  });
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);