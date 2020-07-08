const mongodb = require('mongodb');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: "Add Product", 
    path:"/admin/add-product",
    editing: false
  });
}

exports.postAddProduct = (req, res, next) => {
  const {title, imageUrl, price, description} = req.body
  const product = new Product(title, description, price, imageUrl, null, req.user._id);

  product.save()
  .then(result => {
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // but returns the string.
  if (!editMode) {res.redirect('/');}
  
  const prodId = req.params.productId;
  
  Product.findById(prodId)
    .then(product => {
      console.log(product);
      res.render('admin/edit-product', {
        pageTitle: "Edit Product", 
        path:"/admin/edit-product",
        editing: editMode,
        product: product
      });  
    })
    .catch(err => {
      console.log(err);
    })
}

exports.postEditProduct = (req, res, next) => {
  // fetch information 
  const {productId, title, imageUrl, price, description} = req.body
  const product = new Product(title, description, price, imageUrl, productId);

  product.save()
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err))
    
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.deleteById(productId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

//https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png
    



exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('admin/products', {
        products: products,
        pageTitle: "Admin Products", 
        path: "/admin/products",
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true
      }) 
    })
    .catch(err => {
      console.log(err);
    })
}