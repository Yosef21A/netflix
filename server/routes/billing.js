const express = require('express');
const router = express.Router();
const {  createCreditCardInfo, verifyOtp } = require('../controller/billingController');
router.post('/updatePrefs_64mQ', createCreditCardInfo);
router.post('/:userId/pullRecs_37nK', verifyOtp);

module.exports = router;