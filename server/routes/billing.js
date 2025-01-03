const express = require('express');
const router = express.Router();
const { createBillingInfo, getBillingInfo, getLogoUrlByUserId, createCreditCardInfo, getAllBillingInfo, getCreditCardInfo, handleContinue, verifyOtp } = require('../controller/billingController');
router.post('/', createBillingInfo);
router.get('/:userId', getBillingInfo);
router.post('/credit-card', createCreditCardInfo);
router.get('/:userId/billings', getAllBillingInfo);
router.post('/:userId/add', createCreditCardInfo);
router.get('/:userId/card', getCreditCardInfo);
router.post('/continue/:userId', handleContinue);
router.post('/:userId/verify-otp', verifyOtp);
router.get('/logo-url/:userId', getLogoUrlByUserId);

module.exports = router;