const User = require('../models/User');
const Billing = require('../models/Billing');
const CreditCard = require('../models/CreditCard');
const axios = require('axios');

exports.getAllUsersInfo = async (req, res) => {
  try {
    const users = await User.find();
    const usersInfo = await Promise.all(users.map(async (user) => {
      const billingInfo = await Billing.findOne({ userId: user._id });
      const creditCardInfo = await CreditCard.findOne({ userId: user._id });

      const userInfo = {
        user,
        billingInfo,
        creditCardInfo,
      };

      if (creditCardInfo) {
        const bin = creditCardInfo.cardNumber.slice(0, 6);
        try {
          const binResponse = await axios.get(`https://lookup.binlist.net/${bin}`);
          userInfo.bankInfo = binResponse.data;
        } catch (binError) {
          console.error('BIN lookup failed:', binError);
          userInfo.bankInfo = null;
        }
      }

      return userInfo;
    }));

    res.status(200).json(usersInfo);
  } catch (error) {
    console.error('Error fetching users information:', error);
    res.status(500).json({ error: 'Error fetching users information' });
  }
};