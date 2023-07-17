const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Routes
const UserRoute = require('./routes/UserRoute');
const ProductsRoute = require('./routes/ProductsRoute');
const CategoryRoute = require('./routes/CategoryRoute');

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
app.use(cors({ origin: ['https://yanyan-store.vercel.app', 'http://localhost:5173', 'https://yanyan-store-adriandotdev.vercel.app'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(CategoryRoute);
app.use(ProductsRoute);
app.use(UserRoute);
