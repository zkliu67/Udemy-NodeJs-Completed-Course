const fs = require('fs');
const path = require('path');

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
  constructor(title, imageUrl, price, description) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price
  }

  save() {
    this.id = Math.random().toString();
    //products.push(this); // "this" refers to the object created by the constructor
    getProductsFromFile(products => {
      products.push(this);
      // JSON.stringify javascript arraylist to JSON object.
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
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
}