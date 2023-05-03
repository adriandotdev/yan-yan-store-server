const Joi = require('joi');

const validateProduct = (product) => {
    const productSchema = Joi.object({

        category: Joi.string().required(),
        product: Joi.string().required(),
        price: Joi.number().required(),
        quantity: Joi.number().integer().required(),
        description: Joi.string().allow('')
    });

    const { error } = productSchema.validate(product);

    return { error }
}

module.exports = { validateProduct }