const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JOI Validation
const { validateUser, validateLogin } = require('../validation/userSchemaValidation');

// Models
const User = require('../models/Users');

// Middlewares
const { authenticate } = require('../middlewares/AuthenticateMiddleware');

router.post('/users/add', async (req, res) => {

    const { error } = validateUser(req.body);

    if (error)
        return res.status(404).json({ message: error });

    // Find the username if already exist
    const username = await User.findOne({ username: req.body.username });

    if (username) return res.status(404).json({ message: 'Username already exists.' });

    // Hashed the Password
    const salt = await bcrypt.genSalt(10);
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

router.post('/users/login', authenticate, async (req, res) => {

    if (req.verified) return res.status(200).send({ message: 'Your account has been verified' });

    const { error } = validateLogin(req.body);

    if (error) return res.status(400).send({ message: 'Username and password must be 8 characters long.' });

    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.status(400).send({ message: "Username or password doesn't match." });

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatch) return res.status(400).send({ message: "Username or password doesn't match." });

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);
    const storeOwnerToken = jwt.sign({ _id: user._id }, process.env.STORE_OWNER_TOKEN);

    res.header('auth-token', token);
    res.header('store-owner-token', storeOwnerToken);

    res.status(200).send({ message: 'Successfully Logged In', token });
});

router.post('/users/logout', (req, res) => {

    res.status(200).send({ message: "Logged out successfully" });
});

module.exports = router;