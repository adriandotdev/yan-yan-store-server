const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JOI Validation
const { validateUser, validateLogin } = require('../validation/userSchemaValidation');

// Models
const User = require('../models/Users');

// Middlewares
const { authenticate, authenticateRole } = require('../middlewares/AuthenticateMiddleware');

const ACCOUNT_STATUS = {
    ACTIVE: 'ACTIVE',
    DEACTIVATED: 'DEACTIVATED'
}

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
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        password: hashedPassword
    });

    try {
        await user.save();

        res.status(200).json({ message: "User successfully added!" })
    }
    catch (err) {
        res.status(500).json({ message: "Server Error. We cannot process your request." })
    }
});

router.post('/api/user/verify-login', [authenticate], async (req, res) => {

    if (req.verified) return res.status(200).send({ message: 'Your account has been verified', decodedToken: req.decodedToken });

    return res.status(401).json({ message: 'You are required to login' });
});

router.get('/api/store/users', authenticate, async (req, res) => {

    const users = await User.find({ _id: { $ne: req.decodedToken._id } });

    return res.status(200).json({ users });
});

router.put('/api/store/users/status/:id', authenticate, async (req, res) => {

    if (!req.params.id) return res.status(404).json({ status: 'FAILED', message: 'User ID is required' });

    const response = await User.updateOne({ _id: req.params.id }, {
        $set: {
            accountStatus: req.body.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        }
    });

    if (response.acknowledged) {

        const data = await User.find({ _id: { $ne: req.decodedToken._id } });

        if (data)
            return res.status(200).json({ status: 'OK', data, message: 'User account successfully updated.' });
    }

    return res.status(500).json({ message: 'Server Error' });
});

router.delete('/api/store/users/:id', authenticate, async (req, res) => {

    if (!req.params.id) return res.status(404).json({ status: 'FAILED', message: 'User ID is required.' });

    const response = await User.deleteOne({ _id: req.params.id });

    if (response.acknowledged) {

        const data = await User.find({ _id: { $ne: req.decodedToken._id } });

        if (data)
            return res.status(200).json({ status: 'OK', data, message: 'User deleted successfully.' });
    }

    return res.status(500).json({ message: 'Server Error' });
});

router.post('/users/login', async (req, res) => {

    const { error } = validateLogin(req.body);

    /** Check if the data is followed the restrictions of the schema. */
    if (error) return res.status(400).send({ header: 'Invalid login credentials', message: 'Username and password are required.' });

    const user = await User.findOne({ username: req.body.username });

    // If user doesn't exist
    if (!user) return res.status(400).send({ header: "Invalid login credentials", body: "Please double-check your username and pasword, and try again." });

    if (user.accountStatus === 'INACTIVE') return res.status(400).json({ header: 'Unauthorized', body: 'Account is inactive. Please try to login later.' });

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    // If password is incorrect
    if (!passwordMatch) return res.status(400).send({ header: "Invalid login credentials", body: "Please double-check your username and pasword, and try again." });

    const authToken = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET_TOKEN);

    const decodedToken = jwt.decode(authToken);

    res.cookie('auth-token', authToken, {
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
        httpOnly: true, // Cookie accessible only via HTTP, not JavaScript
        secure: true, // Cookie sent over HTTPS only
    });

    // res.setHeader('Access-Control-Allow-Origin', 'https://yanyan-store.vercel.app');
    // res.setHeader('Access-Control-Allow-Credentials', true);
    res.status(200).send({ message: 'Successfully Logged In', decodedToken });
});

router.post('/users/logout', (req, res) => {

    res.clearCookie('auth-token');
    res.clearCookie('role-token');
    res.status(200).send({ message: "Logged out successfully" });
});

module.exports = router;