const mongodb = require('mongodb');
const getDb = require('../util/database').getDB;

class Product {
  constructor(title, description, price, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    console.log(this._id);
    if (this._id) {
      console.log('updating...');
      // Update new Product
      dbOp = db.collection('products')
        .updateOne({ _id: this._id }, {$set: this})

    } else {
      // Add new product.
      dbOp = db.collection('products').insertOne(this);
    }

    return dbOp
      .then()
      .catch(err => console.log(err))
  }

  static fetchAll() {
    const db = getDb();

    return db.collection('products').find().toArray()
      .then(products => {
        return products;
      })
      .catch(err => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();

    return db.collection('products').find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then(product => {
        return product;
      })
      .catch(err => console.log(err));
  }

  static deleteById(prodId) {

    // delete both in products but also in cart.
    const db = getDb();
    return db.collection('products')
      .deleteOne({ _id: new mongodb.ObjectId(prodId)})
      .then(result => {
        console.log('Deleted!');
        res.redirect('/admin/products');
      })
      .catch(err => console.log(err));
  }
}

module.exports = Product;