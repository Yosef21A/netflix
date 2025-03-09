const crypto = require('crypto');

const generateRandomRoute = (length = 8) => {
    return crypto.randomBytes(length).toString('hex');
};

module.exports = generateRandomRoute;
