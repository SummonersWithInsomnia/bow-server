// jwt Secret
const crypto = require('crypto');
const jwtSecret = crypto.randomBytes(64).toString('hex');

module.exports = jwtSecret;