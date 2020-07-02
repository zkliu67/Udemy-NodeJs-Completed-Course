const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');

// .use allows for adding middlewares
// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// change app.use -> app.get or app.post
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

module.exports = router;
