const ProductRepository = require('../repositories/productRepository');
const ProductDTO = require('../dao/dto/productDTO.js');
const logger = require('../utils/logger.js'); 

class ProductService {
    
    async getProducts() {
        try {
            logger.info('Fetching all products from database');
            return await ProductRepository.getAllProducts();
        } catch (error) {
            logger.error(`Error fetching products: ${error.message}`);
            throw error; 
        }
    }

    async getProductById(pid) {
        return await ProductRepository.getProductByID(pid);
      }

    async getProductByCode(code) {
        try {
            logger.info(`Fetching product by code: ${code}`);
            return await ProductRepository.getProductByCode(code);
        } catch (error) {
            logger.error(`Error fetching product by code ${code}: ${error.message}`);
            throw error;
        }
    }

    async addProduct(productData) {
        try {
            const productDTO = new ProductDTO(productData);
            logger.info(`Adding new product: ${productDTO.name}`);
            return await ProductRepository.addProduct(productDTO);
        } catch (error) {
            logger.error(`Error adding product: ${error.message}`);
            throw error;
        }
    }

    async updateProduct(productId, updatedProductData) {
        try {
            logger.info(`Updating product with ID ${productId}`);
            await ProductRepository.updateProduct(productId, updatedProductData);
        } catch (error) {
            logger.error(`Error updating product with ID ${productId}: ${error.message}`);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            logger.info(`Deleting product with ID ${productId}`);
            await ProductRepository.deleteProduct(productId);
        } catch (error) {
            logger.error(`Error deleting product with ID ${productId}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ProductService();
