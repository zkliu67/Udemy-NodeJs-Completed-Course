const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// setup a certain way for handling incoming request
// defined by express.
const app = express();
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

app.use((req, res, next) => {
  User.findById("5f03fbf798a7ab4fa6fe3d01")
    .then(user => {
      req.user = new User(user.username, user.email, user.cart, user._id); // add a sequelize object not a js object to req.user
      next();
    })
    .catch(err => console.log(err));
})

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
// const errorController = require('./controllers/error');

/% Set the view engine used in the express server %/
app.set('view engine', 'ejs'); // set global configuration value
app.set('views', 'views'); // Tell the express find templates in './views' folder

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public'))); // pass a folder for read only

// Set up routes.
app.use('/admin', adminRoutes);
app.use(shopRoutes);
// app.use(errorController.get404);

// Setup database
mongoConnect(() => {
  app.listen(3000);
})

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

