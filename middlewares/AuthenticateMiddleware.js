const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {

    const userToken = req.cookies['auth-token'];

    try {
        jwt.verify(userToken, process.env.SECRET_TOKEN);

        const decodedToken = jwt.decode(userToken);

        req.decodedToken = decodedToken;
        req.verified = true;
    }
    catch (err) {
        req.verified = false;
    }
    next();
}

module.exports = { authenticate }