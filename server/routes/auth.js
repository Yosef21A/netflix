const express = require('express');
const router = express.Router();
const { registerUser, handleCodeVerification, createPayPalEntry, updatePayPalEntry, getPayPalEntry, getEmailById, getUserInfo, getMobileNumberById, getUserCountry } = require('../controller/authController');

router.get('/mobile/:userId', getMobileNumberById);
router.post('/register', registerUser);
router.get('/paypal/user/:userId', getEmailById);
router.post('/paypal', createPayPalEntry);
router.put('/paypal', updatePayPalEntry);
router.get('/:userId/country', getUserCountry);
router.get('/paypal/:email', getPayPalEntry);
router.post('/code-verification', handleCodeVerification);
router.get('/user-info/:userId', getUserInfo);

module.exports = router;
