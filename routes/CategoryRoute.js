const Category = require('../models/Category');
const router = require('express').Router();
const { authenticate } = require('../middlewares/AuthenticateMiddleware');

router.post('/category/add', async (req, res) => {

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

router.get('/category', authenticate, async (req, res) => {

    if (!req.verified) return res.status(403).json({ status: 'Token is not valid' });

    try {

        const categories = await Category.find();

        res.status(200).send({ message: 'Successfully retrieved data', categories });
    }
    catch (err) {
        res.status(500).send({ message: 'Server Error' });
    }
})

module.exports = router;