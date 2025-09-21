const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  instructorName: {
    type: String,
    required: false,
    default: ''
  },
  completionDate: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  courseDuration: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  certificateUrl: {
    type: String,
    default: ''
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['issued', 'revoked', 'expired'],
    default: 'issued'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  verificationHash: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
certificateSchema.index({ userId: 1, issuedAt: -1 });
certificateSchema.index({ courseId: 1 });
certificateSchema.index({ status: 1 });

// Generate verification hash
certificateSchema.methods.generateVerificationHash = function() {
  const data = `${this.certificateId}-${this.userId}-${this.courseId}-${this.issuedAt}`;
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Static method to verify certificate
certificateSchema.statics.verifyCertificate = async function(certificateId) {
  const certificate = await this.findOne({ certificateId });
  if (!certificate) {
    return { valid: false, message: 'Certificate not found' };
  }
  
  if (certificate.status !== 'issued') {
    return { valid: false, message: `Certificate is ${certificate.status}` };
  }
  
  return { valid: true, certificate };
};

// Static method to get user certificate statistics
certificateSchema.statics.getUserStats = async function(userId) {
  const certificates = await this.find({ userId });
  
  return {
    totalCertificates: certificates.length,
    averageScore: certificates.length > 0 
      ? certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length 
      : 0,
    totalSkills: [...new Set(certificates.flatMap(cert => cert.skills))].length,
    certificatesByMonth: certificates.reduce((acc, cert) => {
      const month = new Date(cert.issuedAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {})
  };
};

// Pre-save middleware to generate verification hash
certificateSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('certificateId')) {
    this.verificationHash = this.generateVerificationHash();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
