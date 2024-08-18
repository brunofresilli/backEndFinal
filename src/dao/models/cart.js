const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema({
    products: [
        {
          product: { type: Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number },
        },
      ],
    });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
