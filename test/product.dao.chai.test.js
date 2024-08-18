const mongoose = require('mongoose');
const ProductDAO = require('../src/dao/productDAO'); 
const { productModel } = require('../src/dao/models/product'); 

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

describe('ProductDAO', function() {
    let expect;
    
    before(async function() {
        await connectToDatabase();
        
        await productModel.deleteMany({});

        
        const chai = await import('chai');
        expect = chai.expect;
    });

    after(async function() {
        
        await mongoose.connection.close();
    });

    beforeEach(async function() {
        
        await productModel.deleteMany({});
    });

    describe('findAll()', function() {
        it('findAll() debe retornar un array de productos', async function() {
            const product1 = await productModel.create({
                title: 'Producto 1',
                description: 'Descripción del producto 1',
                code: 'P1',
                price: 100,
                stock: 10,
                category: 'Categoría 1',
                thumbnails: [],
                owner: 'admin'
            });

            const product2 = await productModel.create({
                title: 'Producto 2',
                description: 'Descripción del producto 2',
                code: 'P2',
                price: 200,
                stock: 20,
                category: 'Categoría 2',
                thumbnails: [],
                owner: 'admin'
            });

            const result = await ProductDAO.findAll();

            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(2);
        });
    });

    describe('create()', function() {
        it('create() debe crear un nuevo producto', async function() {
            const productData = {
                title: 'Producto de prueba',
                description: 'Esta es una descripción de prueba',
                code: 'test123',
                price: 150,
                stock: 30,
                category: 'Prueba',
                thumbnails: [],
                owner: 'admin'
            };

            const result = await ProductDAO.create(productData);
            expect(result).to.be.an('object');
            expect(result.title).to.equal('Producto de prueba');
        });
    });

    describe('findById()', function() {
        it('findById() debe retornar un producto por su ID', async function() {
            const productData = {
                title: 'Producto de prueba',
                description: 'Esta es una descripción de prueba',
                code: 'test123',
                price: 150,
                stock: 30,
                category: 'Prueba',
                thumbnails: [],
                owner: 'admin'
            };

            const newProduct = await ProductDAO.create(productData);
            const result = await ProductDAO.findById(newProduct._id);

            expect(result).to.be.an('object');
            expect(result.title).to.equal('Producto de prueba');
        });
    });

    describe('update()', function() {
        it('update() debe actualizar un producto por su ID', async function() {
            const productData = {
                title: 'Producto de prueba',
                description: 'Esta es una descripción de prueba',
                code: 'test123',
                price: 150,
                stock: 30,
                category: 'Prueba',
                thumbnails: [],
                owner: 'admin'
            };
    
            const newProduct = await ProductDAO.create(productData);
            const updatedProductData = { price: 200 }; 
    
            const result = await ProductDAO.update(newProduct._id, updatedProductData); 
    
            const updatedProduct = await ProductDAO.findById(newProduct._id);
            expect(updatedProduct.price).to.equal(200); 
        });
    });
    describe('delete()', function() {
        it('delete() debe eliminar un producto por su ID', async function() {
            const productData = {
                title: 'Producto de prueba',
                description: 'Esta es una descripción de prueba',
                code: 'test123',
                price: 150,
                stock: 30,
                category: 'Prueba',
                thumbnails: [],
                owner: 'admin'
            };

            const newProduct = await ProductDAO.create(productData);
            const result = await ProductDAO.delete(newProduct._id);
            expect(result).to.be.true;

            const deletedProduct = await ProductDAO.findById(newProduct._id);
            expect(deletedProduct).to.be.null;
        });
    });
});
