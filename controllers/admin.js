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

  req.user.createProduct({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  }).then(result => {
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // but returns the string.
  if (!editMode) {res.redirect('/');}
  
  const prodId = req.params.productId;
  
  Product.findByPk(prodId)
    .then(product => {
      res.render('admin/edit-product', {
        pageTitle: "Edit Product", 
        path:"/admin/add-product",
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

  Product.findByPk(productId)
    .then(product => {
      product.title = title,
      product.imageUrl = imageUrl,
      product.price = price,
      product.description = description
      return product.save()
    })
    .then(result => {
      console.log('update')
      res.redirect('/admin/products');
    })
    .catch()
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByPk(productId)
    .then(product => {
      return product.destroy();
    })
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

//https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
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