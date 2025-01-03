const express = require('express');
const router = express.Router();
const { getAllUsersInfo } = require('../controller/userController');

router.get('/', getAllUsersInfo);

module.exports = router;