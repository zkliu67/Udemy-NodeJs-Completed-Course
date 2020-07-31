const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {

  let page = 1;
  if (req.query.page) { page = +req.query.page; }

  let totalItems;
  
  Product.find().count().then(numberProducts => {
    totalItems = numberProducts;
    return Product.find()
      .skip((page - 1)*ITEMS_PER_PAGE) // skip the first xx items when find
      .limit(ITEMS_PER_PAGE) // limit the number of items retrieved from the database
  })  
  .then(products => {
    res.render('shop/index', {
      products: products,
      pageTitle: "Shop", 
      path: "/",
      currPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    })
  })
  .catch(err => {
    const error = new Error('Failed creating new product');
    error.httpStatusCode = 500;
    return next(error);
  })
}

exports.getProducts = (req, res, next) => {
  //res.send('<h1>Hi express!</h1>'); // allows to send a body to the browser
  // Method for rendering html file
  //res.sendFile(path.join(rootDir, 'views', 'shop.html'));

  let page = 1;
  if (req.query.page) { page = +req.query.page; }

  let totalItems;
  
  Product.find().count().then(numberProducts => {
    totalItems = numberProducts;
    return Product.find()
      .skip((page - 1)*ITEMS_PER_PAGE) // skip the first xx items when find
      .limit(ITEMS_PER_PAGE) // limit the number of items retrieved from the database
  })  
  .then(products => {
    res.render('shop/product-list', {
      products: products,
      pageTitle: "All Products", 
      path: "/products",
      currPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    })
  })
  .catch(err => {
    const error = new Error('Failed creating new product');
    error.httpStatusCode = 500;
    return next(error);
  })
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      console.log(product);
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    });

}

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      console.log(products);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      console.log('CART ADDED!');
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    });
  // let fetchedCart;
  // let newQuantity = 1;

  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({where: {id: prodId}});
  //   })
  //   .then(products => {
  //     let product;

  //     if (products.length > 0) {
  //       product = products[0]
  //     }
  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     // add the product for first time
  //     return Product.findByPk(prodId)
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
  //   })
  //   .then(result => {
  //     res.redirect('/cart');
  //   })
  //   .catch(err => console.log(err))
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    });
}

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     pageTitle: "Checkout",
//     "path": "/checkout"
//   })
// }

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId": req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
        isLoggedIn: req.session.isLoggedIn
      }) 
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })
  
}

exports.postOrder = (req, res, next) => {
  // clear all the cart items
  // remove to the order items
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return {quantity: i.quantity, productData: { ...i.productId._doc }}; // ._doc help to retrieve all the data of the object.
      });
      const order = new Order({
        products: products,
        user: {email: req.user.email, userId: req.user}
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then(order => {
      // if order not found.
      if (!order) {return next(new Error('No order found'));}
      // if not authorized.
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized!'));
      }
      const invoiceName = 'invoice-'+orderId+'.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      // Create a new pdf document
      const pdfDoc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });

      pdfDoc.text('---------------------------');
      
      let totalPrice = 0;

      order.products.forEach(prod => {
        totalPrice = totalPrice + prod.quantity * prod.productData.price;
        pdfDoc
          .fontSize(14)
          .text(prod.productData.title + 
            ' - ' + 
            prod.quantity + 
            ' x ' + ' $ ' + 
            prod.productData.price);
      });
      pdfDoc.text('totalPrice: ' + '$ ' + totalPrice)

      pdfDoc.end();
      // node read the entire file into memory and respond.
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   // directly open the pdf in the browser.
      //   res.setHeader('Content-disposition', 'inline; filename="'+invoiceName+'"');
      //   res.setHeader('Content-type', 'application/pdf');
      //   res.send(data);
      // })
      // To prevent this, streaming it first
      // const file = fs.createReadStream(invoicePath);
      
      // // read the file read stream and call the pipe method to forward the data
      // // the data in the stream to the response.
      // file.pipe(res);

    })
    .catch(err => next(err))
  
}
