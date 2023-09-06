const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const users = require('./routes/users');
const category = require('./routes/category');
const product = require('./routes/product');
const bill = require('./routes/bill')

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use('/users', users);
app.use('/category', category);
app.use('/product', product);
app.use('/bill', bill);

module.exports = app;