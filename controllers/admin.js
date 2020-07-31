const { validationResult } = require('express-validator/check');
const fileHelper = require('../util/file');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
}

exports.postAddProduct = (req, res, next) => {
  const {title, price, description} = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        // imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: 'Attached files is not an image.',
      validationErrors: []
    });
  }
  console.log(image);
  
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        // imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title, 
    description: description, 
    price: price, 
    imageUrl: imageUrl,
    userId: req.user,
  });

  product.save() // save method provided by mongoose
    .then(result => {
      console.log('Product Created');
      return res.redirect('/admin/products');
    }).catch(err => {
      console.log(err);
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // but returns the string.
  if (!editMode) {res.redirect('/');}
  
  const prodId = req.params.productId;
  
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });  
    })
    .catch(err => {
      const error = new Error('Failed creating new product');
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.postEditProduct = (req, res, next) => {
  // fetch information 
  const {productId, title, price, description} = req.body
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    })
  }

  Product.findById(productId).then(product => {
    // Add authorization
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/');
    }
    product.title = title;
    product.description = description;
    if (image) {
      fileHelper.deleteFile(product.image.url);
      product.imageUrl = image.path;
    }
    product.price = price;
    return product.save()
      .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
      })
      .catch(err => {
        const error = new Error('Failed editing product');
        error.httpStatusCode = 500;
        return next(error);
      })
  })
  .catch(err => {
    const error = new Error('Failed getting product');
    error.httpStatusCode = 500;
    return next(error);
  })
}

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(product => {
      if (!product) { return next(new Error('No such product found.')); }
      fileHelper.deleteFile(product.imageUrl);

      return Product.deleteOne({_id: productId, userId: req.user._id});
    })
    .then(() => {
      // res.redirect('/admin/products');
      // Instead of sending a new html response
      console.log('DESTROY PRODUCT.');
      res.status(200).json({message: 'Success!'});
    })
    .catch(err => {
      res.status(500).json({message: 'Failed!'});
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
    })
}

//https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png
    
exports.getProducts = (req, res, next) => {
  
  const user = req.user;

  Product.find({userId: req.user._id})
    .then(products => {
      res.render('admin/products', {
        products: products,
        pageTitle: "Admin Products", 
        path: "/admin/products",
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
        isLoggedIn: req.session.isLoggedIn
      })
    })
    .catch(err => {
      console.log(err);
    });

  // Product.find()
  // //   .select('title price - _id') // defines the select or unselect field.
  // //   .populate('userId', 'name') // populate the provided field with all the information.
  //   .then(products => {
  //     res.render('admin/products', {
  //       products: products,
  //       pageTitle: "Admin Products", 
  //       path: "/admin/products",
  //       hasProducts: products.length > 0,
  //       activeShop: true,
  //       productCSS: true,
  //       isLoggedIn: req.isLoggedIn
  //     }) 
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   })
}