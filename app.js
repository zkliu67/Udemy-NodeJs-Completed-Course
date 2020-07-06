const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

// setup a certain way for handling incoming request
// defined by express.
const app = express();

/% Set the view engine used in the express server %/
app.set('view engine', 'ejs'); // set global configuration value
app.set('views', 'views'); // Tell the express find templates in './views' folder

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public'))); // pass a folder for read only

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user; // add a sequelize object not a js object to req.user
      next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


// defines associations here
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
User.hasMany(Order);
Order.belongsTo(User);
Product.belongsToMany(Order, {through: OrderItem});
Order.belongsToMany(Product, {through: OrderItem});
// sync all the models for creating database;
sequelize
  //.sync({force: true})
  .sync()
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      user = User.create({username: 'Kun', email: 'test@test.com'})
    }
    return user;
  })
  .then(user => {
    
    return user.createCart();
  })
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  })

