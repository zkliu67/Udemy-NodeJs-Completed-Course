const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    // contains an array of objects.
    // with params of product Id and quantity
    // define the type of each params.
    items: [
      {
        productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true}, 
        quantity: {type: Number, required: true}
      }
    ]
  }
});

// Allows to customize functions
userSchema.methods.addToCart = function(product) {
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
    updatedCartItems.push({
      productId: product._id, 
      quantity: newQuantity
    });
  }

  const updatedCart = {items: updatedCartItems};
  // update the user with the new cart
  this.cart = updatedCart;
  return this.save()

}

userSchema.methods.removeFromCart = function(prodId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== prodId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save()
}

userSchema.methods.clearCart = function() {
  this.cart = {items: []}
  return this.save()
}

module.exports = mongoose.model('User', userSchema);

