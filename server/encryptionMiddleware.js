// encryptionMiddleware.js

const CryptoJS = require('crypto-js');
const secretKey = process.env.JWT_SECRET || 'your_default_secret_key';

// Enhanced Middleware to Dynamically Decrypt Incoming Requests
const decryptMiddleware = (req, res, next) => {
  let rawBody = '';

  req.on('data', (chunk) => {
    rawBody += chunk.toString();
  });

  req.on('end', () => {
    try {
      // Buffer the request body
      req.rawBody = rawBody;

      // Check if the body contains encryptedData
      if (rawBody.startsWith('{') && rawBody.endsWith('}')) {
        const parsedBody = JSON.parse(rawBody);

        // Only attempt decryption if encryptedData is present
        if (parsedBody && parsedBody.encryptedData) {
          console.log('Encrypted Data Received:', parsedBody.encryptedData);

          const bytes = CryptoJS.AES.decrypt(parsedBody.encryptedData, secretKey);
          const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

          console.log('Decrypted Data:', decryptedData);

          // Parse the decrypted JSON string back to an object
          req.body = JSON.parse(decryptedData);
        } else {
          // If no encryptedData, treat as normal JSON payload
          req.body = parsedBody;
        }
      } else {
        // If body isn't JSON, pass it as-is
        req.body = rawBody;
      }

      // Restore the stream for bodyParser.json() to read
      req.headers['content-length'] = Buffer.byteLength(req.rawBody);
      req._body = false;
      next();
    } catch (error) {
      console.error('Decryption Error:', error);
      return res.status(400).json({ message: 'Invalid request data' });
    }
  });
};

// Middleware to Encrypt Outgoing Responses
const encryptMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'object') {
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(body), secretKey).toString();
      console.log('Encrypted Response:', ciphertext);
      const encryptedResponse = JSON.stringify({ encryptedData: ciphertext });
      originalSend.call(this, encryptedResponse);
    } else {
      originalSend.call(this, body);
    }
  };
  next();
};

module.exports = { decryptMiddleware, encryptMiddleware };
