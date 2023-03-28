const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    role: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        minLength: 8,
        required: true
    },
    password: {
        type: String,
        minLength: 8,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;