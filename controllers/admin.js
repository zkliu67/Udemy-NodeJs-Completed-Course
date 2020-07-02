const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: "Add Product", 
    path:"/admin/add-product"
  });
}

exports.postAddProduct = (req, res, next) => {
  const {title, imageUrl, price, description} = req.body
  const product = new Product(title, imageUrl, price, description);
  product.save();
  res.redirect('/');
}

//https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      products: products,
      pageTitle: "Admin Products", 
      path: "/admin/products",
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    })
  });
}