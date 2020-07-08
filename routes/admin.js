const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');

// .use allows for adding middlewares

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// change app.use -> app.get or app.post
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
