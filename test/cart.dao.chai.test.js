const mongoose = require('mongoose');
const Cart = require('../src/dao/models/cart.js'); 



const mongoUrl = "mongodb+srv://BrunoFresilli:nerfxnephipls11@cluster0.kouwtog.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoUrl, {
            dbName: 'TEST1'
        });
        console.log('Conexión a MongoDB Atlas establecida.');
    } catch (error) {
        console.error('Error al conectar a MongoDB Atlas:', error);
    }
}

describe('cartDAO', function() {
    before(async function() {
        await connectToDatabase();

        await Cart.deleteMany({});


        const chai = await import('chai');
        expect = chai.expect;
    });

    beforeEach(async function () {

    });


    after(async function () {
        await mongoose.connection.close();
    });


    it('createCart() debería crear un nuevo carrito vacío', async () => {
        const cart = new Cart();
        const savedCart = await cart.save();

        expect(savedCart).to.have.property('_id');
        expect(savedCart.products).to.be.an('array').that.is.empty;
    });

    it('getCartById() debería devolver un carrito por su ID', async () => {

        const productId = new mongoose.Types.ObjectId(); 
        const cart = new Cart({
            products: [{ product: productId, quantity: 1 }]
        });
        const savedCart = await cart.save();

        
        const foundCart = await Cart.findById(savedCart._id);

        expect(foundCart).to.have.property('_id');
        expect(foundCart._id.toString()).to.equal(savedCart._id.toString());
        expect(foundCart.products).to.be.an('array').that.has.lengthOf(1);
        expect(foundCart.products[0]).to.have.property('product').that.is.an('object');
        expect(foundCart.products[0].product.toString()).to.equal(productId.toString());
    });
});