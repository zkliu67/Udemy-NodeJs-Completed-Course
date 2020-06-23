const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// setup a certain way for handling incoming request
// defined by express.
const app = express();
app.set('view engine', 'pug'); // set global configuration value
app.set('views', 'views'); // Tell the express find templates in './views' folder

const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public'))); // pass a folder for read only

app.use('/admin', adminRoute.routes);
app.use(shopRoute);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})

app.listen(3000);