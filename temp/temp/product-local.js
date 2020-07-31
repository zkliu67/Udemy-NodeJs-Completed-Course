/* This part we use local json file for items
//const fs = require('fs');
//const path = require('path');

const Cart = require('../models/cart');


const p = 
  path.join(path.dirname(process.mainModule.filename), 
  'data', 
  'products.json'
  );

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        cb([]);
      } else {
        cb(JSON.parse(fileContent));
      }
    });
}


module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price
  }

  save() {
    // "this" refers to the object created by the constructor
    getProductsFromFile(products => {

      // Check if the product exists
      if (this.id) {
        const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;

        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });

      } else {
        this.id = Math.random().toString();
        products.push(this);
        // JSON.stringify javascript arraylist to JSON object.
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });  
      }
    });
  }

  // keyword static refers to the class itself, not an instantiated object.
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      cb(product);
    })
  }

  static deleteById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      const updatedProducts = products.filter(prod => prod.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if (!err) {
          // remove from the cart
          Cart.deteleProduct(id, product.price);
        }
      })
    })
  }
}

*/