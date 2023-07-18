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

    res.setHeader('Access-Control-Allow-Origin', 'https://yanyan-store.vercel.app');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}

module.exports = { authenticate }