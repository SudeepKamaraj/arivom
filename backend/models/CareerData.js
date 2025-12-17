const mongoose = require('mongoose');

const careerDataSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    required: true
  },
  salaryRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requiredSkills: [{
    skill: {
      type: String,
      required: true
    },
    importance: {
      type: String,
      enum: ['must-have', 'nice-to-have', 'preferred'],
      default: 'must-have'
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  benefits: [String],
  category: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  applicationUrl: {
    type: String
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
careerDataSchema.index({ category: 1, experienceLevel: 1 });
careerDataSchema.index({ 'requiredSkills.skill': 1 });
careerDataSchema.index({ location: 1, remote: 1 });
careerDataSchema.index({ jobTitle: 'text', description: 'text' });

module.exports = mongoose.model('CareerData', careerDataSchema);