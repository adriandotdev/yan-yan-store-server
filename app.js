const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/Users');
const Product = require('./models/Products');
const Category = require('./models/Category');

// Validations
const { validateUser, validateLogin } = require('./validation/userSchemaValidation');

const mongoose = require('mongoose');
const PORT = process.env.PORT || 3001;

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName: process.env.DB_NAME }).then((res) => {

    console.log("CONNECTED TO DATABASE");

    app.listen(PORT, () => {

        console.log(`SERVER LISTEN TO: ${PORT}`)
    });
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/products', (req, res) => {

    Product.find().then(products => console.log(products))
        .catch(err => console.error(err))
})

app.post('/products/add', (req, res) => {

    const newProduct = new Product(req.body);

    newProduct.save().then((result) => {

        console.log("SAVED!");
        res.json({ status: 'OK' })
    }).catch(_err => res.json({ status: 404 }))
});

app.delete('/products/:id', (req, res) => {

    Product.deleteOne({ _id: req.params.id })
        .then(result => res.json({ status: 'OK ' }))
        .catch(err => res.json({ status: 'ERROR' }))
});

app.post('/users/add', async (req, res) => {

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

app.post('/category/add', async (req, res) => {

    const newCategory = new Category({
        category: req.body['category']
    });

    try {
        const response = await newCategory.save();

        res.send({ response, message: 'Category successfully saved' });
    }
    catch (err) {
        res.send({ err })
    }
});

app.get('/category', async (req, res) => {

    try {

        const categories = await Category.find();

        res.status(200).send({ message: 'Successfully retrieved data', categories });
    }
    catch (err) {
        res.status(500).send({ message: 'Server Error' });
    }
})

app.post('/users/login', authenticate, async (req, res) => {

    if (req.verified) return res.status(200).send({ message: 'Your account has been verified' });

    const { error } = validateLogin(req.body);

    if (error) return res.status(400).send({ message: 'Username and password must be 8 characters long.' });

    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.status(400).send({ message: "Username or password doesn't match." });

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatch) return res.status(400).send({ message: "Username or password doesn't match." });

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);
    const storeOwnerToken = jwt.sign({ _id: user._id }, process.env.STORE_OWNER_TOKEN);

    req.session.isAuth = token;
    console.log("SESSION: " + req.session.isAuth);

    res.header('auth-token', token);
    res.header('store-owner-token', storeOwnerToken);

    res.status(200).send({ message: 'Successfully Logged In', token });
});

app.post('/logout', (req, res) => {

    res.status(200).send({ message: "Logged out successfully" });
});

function authenticate(req, res, next) {

    // Check for authorization header.
    const authHeader = req.headers['authorization'];

    // If empty, return false
    if (!authHeader) req.verified = false;

    // Split the Bearer and the token.
    const userToken = authHeader?.split(' ')[1];

    try {
        jwt.verify(userToken, process.env.SECRET_TOKEN);

        console.log("VERIFIED: " + true);
        req.verified = true;
    }
    catch (err) {
        req.verified = false;
    }

    next();
}