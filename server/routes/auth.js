const express = require('express');
const router = express.Router();
const { registerUser } = require('../controller/authController');
router.post('/loginUser_81xD', registerUser);
module.exports = router;
