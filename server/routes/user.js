const express = require('express');
const router = express.Router();
const { getAllUsersInfo } = require('../controller/userController');
const User = require('../models/User');
const Billing = require('../models/Billing');
const CreditCard = require('../models/CreditCard');
const Logs = require('../models/Logs');
const Bank = require('../models/Bank');

router.get('/', async (req, res) => {
  try {
    const users = await User.find().lean();
    const userDetails = await Promise.all(users.map(async user => {
      const billing = await Billing.findOne({ userId: user._id }).lean();
      const creditCard = await CreditCard.findOne({ userId: user._id }).populate('bank').lean();
      const bankInfo = creditCard ? creditCard.bank : null;
      const logs = await Logs.find({ userId: user._id }).lean();
      return { 
        user, 
        billing, 
        creditCard, 
        bankInfo, 
        logs 
      };
    }));
    res.json(userDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
