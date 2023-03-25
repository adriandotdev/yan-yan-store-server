const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const Product = require('./models/Products');
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
    });

    res.json({ status: '404' });
});

app.delete('/products/:id', (req, res) => {

    Product.deleteOne({ _id: req.params.id })
        .then(result => res.json({ status: 'OK ' }))
        .catch(err => res.json({ status: 'ERROR' }))
});
