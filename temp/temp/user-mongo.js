const mongodb = require('mongodb');
const getDb = require('../../util/database').getDB;

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart; // {items; []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this)
      .then(result => {console.log(result)})
      .catch(err => console.log(err))
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString(); // === only works with string and types
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      // product is already exists.
      newQuantity = this.cart.items[cartProductIndex].quantity + 1; // update the quantity
      updatedCartItems[cartProductIndex].quantity = newQuantity; // update the cart product with index
    } else {
      // if not exist, push a new record into the cart.
      updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity});
    }

    const updatedCart = {items: updatedCartItems};
    const db = getDb();
    // update the user with the new cart
    return db
      .collection('users').updateOne(
      {_id: new mongodb.ObjectId(this._id)}, 
      {$set: {cart: updatedCart}}
    );
  }

  getCart() {
    // get the product in the cart and also the quantity.
    const db = getDb(); // get the database
    const productIds = this.cart.items.map(i => i.productId); // get productId of cart items and stores in an array.
    
    return db
      .collection('products').find({ _id: {$in: productIds} }).toArray() // get the products that id matches and convert to an array.
      .then(products => {
        if (products.length < productIds.length) {
          let newCartItems = [];

          if (products.length == 0) {
            // if the products returns null but there is some items in the cart
            // reset the cart.
            this.cart = { items: newCartItems};
          }

          else {
            newCartItems = products.map(p => {
              return {
                productId: p._id,
                quantity: this.cart.items.find(i => {
                  return i.productId.toString() === p._id.toString();
                }).quantity
              }
            })

            this.cart = {items: newCartItems};
          }
          // update the user cart.
          db
            .collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) }, 
              {$set: { cart: { items: newCartItems } }}
            );
        }
        // return the cart items
        return products.map(p => {
          return {
            ...p, 
            quantity: this.cart.items.find(i => {
              return i.productId.toString() === p._id.toString();
          }).quantity
        };
        })
      })
  }

  deleteItemfromCart(prodId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== prodId.toString();
    });

    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        {_id: new mongodb.ObjectId(this._id)},
        {$set: {cart: {items: updatedCartItems}}}
      );
  }

  addOrder() {
    // create a new order
    const db = getDb();

    // get the product object inside the cart
    return this.getCart().then(products => {
      // create the order object
      const order = { 
        items: products,
        user: {
          _id: new mongodb.ObjectId(this._id),
          username: this.username,
          email: this.email
        }
      };
      return db.collection('orders').insertOne(order);
    })
    .then(result => {
      this.cart = { items: []};
      return db
        .collection('users')
        .updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: { cart: {items: []} }})
    })
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({'user._id': new mongodb.ObjectId(this._id)})
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users')
      .findOne({ _id: new mongodb.ObjectId(userId)})
      .then(user => {
        return user;
      })
      .catch(err => console.log(err))
  }
}

module.exports = User;