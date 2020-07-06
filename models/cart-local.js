const fs = require('fs');
const path = require('path');

const p = 
  path.join(path.dirname(process.mainModule.filename), 
  'data', 
  'cart.json'
  );

const getCartFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb(null);
    } else {
      cb(JSON.parse(fileContent));
    }
  })
}

module.exports = class Cart {

  static addProduct(id, productPrice) {
    /*
    // Fetch the previous cart
    getCartFromFile(cart => {
      if (cart) {
        cart = {products: [], totalPrice: 0};
      }
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(p => p.id === id);
      const existingProduct = cart.products[existingProductIndex];

      let updatedProduct;

      if (existingProduct) {
        updatedProduct = {...existingProduct};
        updatedProduct.qty = updatedProduct.qty + 1;

        cart.products  = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;

      } else {
        updatedProduct = {id: id, qty: 1};
        cart.products = [ ...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;

      console.log(cart);
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
    })
    */
    fs.readFile(p, (err, fileContent) => {
      let cart = {products: [], totalPrice: 0};
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(p => p.id === id);
      const existingProduct = cart.products[existingProductIndex];

      let updatedProduct;

      if (existingProduct) {
        updatedProduct = {...existingProduct};
        updatedProduct.qty = updatedProduct.qty + 1;

        cart.products  = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;

      } else {
        updatedProduct = {id: id, qty: 1};
        cart.products = [ ...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;

      console.log(cart);
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
      
    
    })
    // Add new product / increase quantity
    
  }

  static deteleProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        console.log(err);
        return;
      }

      const updatedCart = {...JSON.parse(fileContent)};
      const product = updatedCart.products.find(prod => prod.id === id);

      if (!product) {
        return;
      }
      
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        prod => prod.id !== id
      )
      updatedCart.totalPrice = updatedCart.totalPrice - productQty * productPrice;
      
      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        console.log(err);
      })
    })
  }

  static getProducts(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);

      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    })
  }


}