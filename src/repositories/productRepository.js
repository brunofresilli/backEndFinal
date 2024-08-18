const ProductDAO = require('../dao/productDAO');
const Product = require('../dao/models/product.js');
const logger = require('../utils/logger');
const ProductDTO = require('../dao/dto/productDTO');

class ProductRepository {
    async getAllProducts() {
        try {
            const products = await ProductDAO.findAll();
            return products.map(product => new ProductDTO(product));
        } catch (error) {
            logger.error(`Error fetching all products: ${error.message}`);
            throw new Error("Error fetching all products");
        }
    }

    async getProductByID(pid) {
        try {
          const product = await ProductDAO.findById(pid);
          if (!product) throw new Error(`Product with ID ${pid} does not exist!`);
          return product;
        } catch (error) {
          throw new Error("Error fetching product: " + error.message);
        }
      }
    

    async getProductByCode(code) {
        try {
            const product = await ProductDAO.findByCode(code);
            return product ? new ProductDTO(product) : null;
        } catch (error) {
            logger.error(`Error fetching product with code ${code}: ${error.message}`);
            throw new Error(`Error fetching product with code ${code}`);
        }
    }

    async addProduct(productData) {
        try {
            const newProduct = await ProductDAO.create(productData);
            return new ProductDTO(newProduct);
        } catch (error) {
            logger.error(`Error adding product: ${error.message}`);
            throw new Error("Error adding product");
        }
    }

    async updateProduct(id, updatedProductData) {
        try {
            await ProductDAO.update(id, updatedProductData);
        } catch (error) {
            logger.error(`Error updating product with ID ${id}: ${error.message}`);
            throw new Error(`Error updating product with ID ${id}`);
        }
    }

    async deleteProduct(id) {
        try {
            await ProductDAO.delete(id);
        } catch (error) {
            logger.error(`Error deleting product with ID ${id}: ${error.message}`);
            throw new Error(`Error deleting product with ID ${id}`);
        }
    }

    async getById(id) {
        try {
            console.log('Buscando producto por ID:', id);
            const product = await Product.findById(id).lean();
            return product;
        } catch (error) {
            console.log(`Error buscando producto por ID ${id}: ${error.message}`);
            throw new Error(`Error buscando producto por ID ${id}`);
        }
    }

    async update(product) {
        return product.save();
    }
}

module.exports = new ProductRepository();