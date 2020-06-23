const path = require('path');
const express = require('express');
const router = express.Router();

const rootDir = require('../util/path');

const products = []; // An array for storing all products.

// .use allows for adding middlewares
router.get('/add-product', (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
})

// change app.use -> app.get or app.post
router.post('/add-product', (req, res, next) => {
  products.push({title: req.body.title});
  res.redirect('/');
})

exports.routes = router;
exports.products = products;