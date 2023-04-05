const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {

    // Check for authorization header.
    const authHeader = req.headers['authorization'];

    // If empty, return false
    if (!authHeader) req.verified = false;

    // Split the Bearer and the token.
    const userToken = authHeader?.split(' ')[1];

    try {
        jwt.verify(userToken, process.env.SECRET_TOKEN);
        req.verified = true;
    }
    catch (err) {
        req.verified = false;
    }

    next();
}

module.exports = { authenticate }