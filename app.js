const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const MONGODB_URI = 'mongodb+srv://admin:admin@shop.wyugv.mongodb.net/node-udemy?retryWrites=true&w=majority';

// setup a certain way for handling incoming request
// defined by express.
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI, // the url to the mongodb
  collection: 'sessions'
});

// for any non-get request, need a csrf token to identify the identity of the user.
const csrfProtection = csrf();

// config the storage engine.
const fileStorage = multer.diskStorage({
  // store the images in the local storage.
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString()+'-'+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png'||file.mimetype === 'image/jpg'||file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

/% Set the view engine used in the express server %/
app.set('view engine', 'ejs'); // set global configuration value
app.set('views', 'views'); // Tell the express find templates in './views' folder

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public'))); // pass a folder for read only
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: 'mysecret', // secret: signing the hash for saving a cookie, should be a long string value
  resave: false, // resave: the session wont be saved on every request that is done, but only something changes in the session.
  saveUninitialized: false,
  store: store
  // cookie: {maxAge: 10, }
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User.findById(req.session.user._id)
      .then(user => {
        if (!user) {return next();}
        req.user = user; // which is mongoose object with all methods;
        next();
      })
      .catch(err => {
        throw new Error(err);
      });
  }
  
});

// set local variables that are passed to views
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

// Set up routes.
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  console.log(error);
  // res.status(error.httpStatusCode).render(...);
  res.redirect('/500');
});

// Setup database
mongoose.connect(MONGODB_URI)
  .then(result => {
    // findOne: returns the user first it finds.
    // User.findOne().then(user => {
    //   if (!user) {
    //     const user = new User({
    //       name: 'kun',
    //       email: 'test@test.com',
    //       cart: {items: []}
    //     });
    //     user.save();    
    //   }
    // });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  })
// mongoConnect(() => {
//   
// })

// const sequelize = require('./util/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');



// // defines associations here
// Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, {through: CartItem});
// Product.belongsToMany(Cart, {through: CartItem});
// User.hasMany(Order);
// Order.belongsTo(User);
// Product.belongsToMany(Order, {through: OrderItem});
// Order.belongsToMany(Product, {through: OrderItem});
// // sync all the models for creating database;
// sequelize
//   //.sync({force: true})
//   .sync()
//   .then(result => {
//     return User.findByPk(1);
//   })
//   .then(user => {
//     if (!user) {
//       user = User.create({username: 'Kun', email: 'test@test.com'})
//     }
//     return user;
//   })
//   .then(user => {
    
//     return user.createCart();
//   })
//   .then(result => {
//     app.listen(3000);
//   })
//   .catch(err => {
//     console.log(err);
//   })

