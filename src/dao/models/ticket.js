const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ticketSchema = new Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  products: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
  },
  purchase_datetime: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String,
    required: true
  }
});


const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
