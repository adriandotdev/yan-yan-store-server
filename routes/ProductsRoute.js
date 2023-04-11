const Product = require('../models/Products');
const router = require('express').Router();

router.get('/products', async (req, res) => {

    const products = await Product.find();

    return res.status(200).json(products);
})

router.post('/products/add', async (req, res) => {

    const newProduct = new Product(req.body);

    try {
        const response = await newProduct.save();

        if (response)
            res.status(200).send({ message: 'Product saved successfully' });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
});

router.delete('/products/:id', (req, res) => {

    Product.deleteOne({ _id: req.params.id })
        .then(result => res.json({ status: 'OK ' }))
        .catch(err => res.json({ status: 'ERROR' }))
});

module.exports = router;