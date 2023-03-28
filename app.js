const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/Users');
const Product = require('./models/Products');

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

app.post('/users/login', async (req, res) => {

    const { error } = validateLogin(req.body);

    if (error) return res.status(400).send({ message: 'Username and password must be 8 characters long.' });

    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.status(400).send({ message: "Username or password doesn't match." });

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatch) return res.status(400).send({ message: "Username or password doesn't match." });

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);
    res.header('auth-token', token);

    const decoded = jwt.decode(token);

    res.status(200).send({ message: 'Successfully Logged In', token, decoded });
});

app.get('/sales', (req, res, next) => {

    const token = req.header('auth-token');
    if (!token) res.status(401).send({ message: 'ACCESS DENIED' });

    try {

        const verified = jwt.verify(token, process.env.SECRET_TOKEN);

        req.user = verified;
    }
    catch (err) {
        res.status(400).send("INVALID TOKEN");
    }
    next();
}, (req, res) => {

    res.send(req.user)
})