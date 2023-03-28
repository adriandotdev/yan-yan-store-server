const Joi = require('joi');

// User Schema Validation
const validateUser = (user) => {

    // Schema
    const userSchemaValidation = Joi.object({

        role: Joi.string().required(),
        name: Joi.string().required(),
        username: Joi.string().min(8).required(),
        password: Joi.string().min(8).required(),
        "confirm-pass": Joi.ref('password')
    });

    const { error } = userSchemaValidation.validate(user);

    return { error };
}

const validateLogin = (loginDetails) => {

    const loginSchemaValidation = Joi.object({

        username: Joi.string().min(8).required(),
        password: Joi.string().min(8).required()
    })

    const { error } = loginSchemaValidation.validate();

    return { error }
}

module.exports = { validateUser, validateLogin }