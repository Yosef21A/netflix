import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

const encryptedFetch = (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Encrypt the request body if it exists
  let body = options.body;
  if (body) {
    const encryptedBody = CryptoJS.AES.encrypt(JSON.stringify(body), SECRET_KEY).toString();
    body = JSON.stringify({ data: encryptedBody });
  }

  return fetch(url, { ...options, headers, body })
    .then(response => response.text()) // Get the raw text first
    .then(encryptedText => {
      if (!encryptedText) return null;
      
      // Decrypt the response text
      const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      return JSON.parse(decryptedData);
    })
    .catch(err => {
      console.error("Fetch Error:", err);
      throw err;
    });
};

export default encryptedFetch;
