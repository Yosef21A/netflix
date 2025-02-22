// server/models/CreditCard.js
const mongoose = require('mongoose');

const creditCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  securityCode: {
    type: String,
    required: true,
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  otp: {
    type: String,
    default: null
  },
  otpVerified: {
    type: Boolean,
    default: false
  }
});

const CreditCard = mongoose.model('CreditCard', creditCardSchema);

module.exports = CreditCard;
