const mongoose = require('mongoose');

const peerRelationshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  relationshipType: {
    type: String,
    enum: ['study-buddy', 'mentor-mentee', 'peer'],
    default: 'study-buddy'
  },
  sharedInterests: [String],
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate relationships
peerRelationshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Index for better query performance
peerRelationshipSchema.index({ status: 1 });
peerRelationshipSchema.index({ relationshipType: 1 });

module.exports = mongoose.model('PeerRelationship', peerRelationshipSchema);