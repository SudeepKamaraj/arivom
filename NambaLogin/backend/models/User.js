const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, sparse: true },
  address: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  emailVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpiresAt: Date,
  resetCode: String,
  resetExpiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);