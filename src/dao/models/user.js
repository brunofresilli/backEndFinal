const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'],
        default: 'user'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    documents: { 
        type: [{ name: String, reference: String }]
    },
    last_connection: { 
        type: Date 
    }

});

const User = mongoose.model('User', userSchema);

module.exports = User ;



