const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bin: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  bankName: String,
  countryName: String,
  countryEmoji: String,
  scheme: String,
  type: String,
  brand: String,
  logoUrl: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Bank', bankSchema);