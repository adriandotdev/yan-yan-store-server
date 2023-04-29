const Product = require('../models/Products');
const router = require('express').Router();
const { validateProduct } = require('../validation/productSchemaValidation');

router.get('/products', async (req, res) => {

    try {
        const products = await Product.find();

        return res.status(200).json({ products, status: 'OK' });
    }
    catch (err) {
        return res.status(500).json({ status: 'FAILED', message: 'Server error' })
    }
})

router.post('/products/filter', async (req, res) => {

    if (req.body.categories.length < 1) return res.sendStatus(200);

    const response = await Product.find({ "category": { $in: req.body.categories } })

    res.status(200).json({ products: response })
})

router.post('/products/add', async (req, res) => {

    const { error } = validateProduct(req.body);

    if (error) return res.status(404).json({ status: 'FAILED', message: 'Please provide all of the required fields.' })

    const newProduct = new Product(req.body);

    try {
        const response = await newProduct.save();

        if (response)
            res.status(200).send({ message: 'Product successfully added' });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
});

router.put('/products/:id', async (req, res) => {

    if (!req.params.id) return res.status(404).json({ status: 'FAILED', message: 'Product ID is required' });

    const response = await Product.updateOne({ _id: req.params.id }, {
        $set: {
            category: req.body.category,
            product: req.body.product,
            price: req.body.price,
            quantity: req.body.quantity
        }
    })

    if (response.acknowledged) {

        const data = await Product.find();

        if (data)
            return res.status(200).json({ status: 'OK', products: data, message: 'Product deleted successfully' });
    }

    return res.status(500).json({ status: 'FAILED', message: 'Server error' });
})

router.delete('/products/:id', async (req, res) => {

    if (!req.params.id) return res.status(404).json({ status: 'FAILED', message: 'Product ID is required' });

    const response = await Product.deleteOne({ _id: req.params.id });

    if (response.acknowledged) {

        const data = await Product.find();

        if (data)
            return res.status(200).json({ status: 'OK', products: data, message: 'Product deleted successfully' });
    }

    return res.status(500).json({ status: 'FAILED', message: 'Server error' });
});

module.exports = router;