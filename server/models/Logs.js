const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  email: {
    type: String,
    sparse: true,
  },
  mobileNumber: {
    type: String,
    sparse: true,
  },
  password: {
    type: String,
    required: false,
  },
  OTPcode: {
    type: String, // New field for the verification code
    default: ''
  },
});

logsSchema.pre('validate', function(next) {
  if (!this.email && !this.mobileNumber) {
    this.invalidate('email', 'Either email or mobile number is required.');
    this.invalidate('mobileNumber', 'Either email or mobile number is required.');
  }
  next();
});

const Logs = mongoose.model('Logs', logsSchema);

module.exports = Logs;