const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    category: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;