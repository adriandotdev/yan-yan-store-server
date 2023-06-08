const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JOI Validation
const { validateUser, validateLogin } = require('../validation/userSchemaValidation');

// Models
const User = require('../models/Users');

// Middlewares
const { authenticate, authenticateRole } = require('../middlewares/AuthenticateMiddleware');

router.post('/users/add', async (req, res) => {

    const { error } = validateUser(req.body);

    if (error)
        return res.status(404).json({ message: error });

    // Find the username if already exist
    const username = await User.findOne({ username: req.body.username });

    if (username) return res.status(404).json({ message: 'Username already exists.' });

    // Hash the Password
    const salt = await bcrypt.genSalt(10); // Generate the salt.
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // New User
    const user = new User({
        role: req.body.role,
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword
    });

    try {
        await user.save();

        res.status(200).json({ message: "User successfully added!" })
    }
    catch (err) {
        res.status(500).json({ message: "Server Error. We cannot process your request." })
    }
})

router.post('/api/user/verify-login', [authenticate], async (req, res) => {

    if (req.verified) return res.status(200).send({ message: 'Your account has been verified', decodedToken: req.decodedToken });

    return res.status(401).json({ message: 'You are required to login' });
});

router.post('/users/login', async (req, res) => {

    const { error } = validateLogin(req.body);

    /** Check if the data is followed the restrictions of the schema. */
    if (error) return res.status(400).send({ message: 'Username and password must be 8 characters long.' });

    const user = await User.findOne({ username: req.body.username });

    // If user doesn't exist
    if (!user) return res.status(400).send({ message: "Username does not exist." });

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    // If password is incorrect
    if (!passwordMatch) return res.status(400).send({ message: "Password is incorrect." });

    const authToken = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_TOKEN);

    const decodedToken = jwt.decode(authToken);

    res.cookie('auth-token', authToken, {
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
        httpOnly: true, // Cookie accessible only via HTTP, not JavaScript
        secure: true, // Cookie sent over HTTPS only
    });

    res.status(200).send({ message: 'Successfully Logged In', decodedToken });
});

router.post('/users/logout', (req, res) => {

    res.clearCookie('auth-token');
    res.clearCookie('role-token');
    res.status(200).send({ message: "Logged out successfully" });
});

module.exports = router;