const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      products: products,
      pageTitle: "Shop", 
      path: "/"
    })
  });
}

exports.getProducts = (req, res, next) => {
  //res.send('<h1>Hi express!</h1>'); // allows to send a body to the browser
  // Method for rendering html file
  //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      products: products,
      pageTitle: "All Products", 
      path: "/products",
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    })
  });
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId, product => {
    res.render('shop/product-detail', {
      "product": product,
      "pageTitle": product.title,
      "path": '/products'
    })
  });

}

exports.getCart = (req, res, next) => {
  res.render('shop/cart', {
    pageTitle: "Your Cart",
    "path": "/cart"
  })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId.trim(), product => {
    console.log(product);
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart')
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: "Checkout",
    "path": "/checkout"
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: "Your Orders",
    "path": "/orders"
  })
}