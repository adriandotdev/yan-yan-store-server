const Category = require('../models/Category');
const router = require('express').Router();

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

router.get('/category', async (req, res) => {

    try {

        const categories = await Category.find();

        res.status(200).send({ message: 'Successfully retrieved data', categories });
    }
    catch (err) {
        res.status(500).send({ message: 'Server Error' });
    }
})

module.exports = router;