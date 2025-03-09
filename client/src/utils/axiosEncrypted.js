// src/utils/axiosEncrypted.js

import axios from 'axios';
import CryptoJS from 'crypto-js';

// Secret Key
const secretKey = process.env.REACT_APP_SECRET_KEY;

// Get the API URL from .env
const baseURL = process.env.REACT_APP_API_URL;

// Encrypt Payload Function
const encryptPayload = (data) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  console.log('Encrypted Payload:', ciphertext); // Log encrypted payload
  return { encryptedData: ciphertext };  // Send as { encryptedData: ... }
};

// Decrypt Response Function
const decryptResponse = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Decryption Error:', error);
    return null;
  }
};

// Create Axios Instance
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Encrypt Payload
axiosInstance.interceptors.request.use((config) => {
  if (config.data) {
    config.data = encryptPayload(config.data);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor - Decrypt Response
axiosInstance.interceptors.response.use((response) => {
  // Expecting the response to be in the format: { encryptedData: "..." }
  if (response.data && response.data.encryptedData) {
    response.data = decryptResponse(response.data.encryptedData);
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
