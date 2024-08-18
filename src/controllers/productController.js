const productService = require('../services/productService.js');
const CustomError = require('../services/errors/CustomError.js');
const { ErrorCodes } = require('../services/errors/enums.js');
const { generateProductsErrorInfo } = require('../services/errors/info.js');
const logger = require('../utils/logger');

class ProductController {

    async getProducts(req, res, next) {
        try {
            const products = await productService.getProducts();
            logger.info('Productos obtenidos correctamente');
            res.status(200).json(products);
        } catch (error) {
            logger.error('Error al obtener productos', { error });
            next(CustomError.createError({
                name: 'Database Error',
                cause: error,
                message: 'Error al obtener productos',
                code: ErrorCodes.DATABASE_ERROR,
            }));
        }
    }

    async getProductById(pid) {
        try {
          return await productService.getProductById(pid);
        } catch (error) {
          console.error(error.message);
          throw new Error("Error fetching product");
        }
      }

    async getProductByCode(req, res, next) {
        try {
            const code = req.params.code;
            const product = await productService.getProductByCode(code);
            if (!product) {
                logger.warn(`Producto no encontrado: código ${code}`);
                throw CustomError.createError({
                    name: 'Product Not Found',
                    cause: `Producto con código ${code} no encontrado`,
                    message: 'Producto no encontrado',
                    code: ErrorCodes.PRODUCT_NOT_FOUND,
                });
            }
            logger.info('Producto obtenido correctamente por código', { code });
            res.status(200).json(product);
        } catch (error) {
            logger.error('Error al obtener producto por código', { error });
            next(error);
        }
    }

    async addProduct(req, res, next) {
        try {
            const productData = req.body;

            if (!isValidProductData(productData)) {
                logger.warn('Datos de producto inválidos', { productData });
                const error = CustomError.createError({
                    name: 'Invalid Types Error',
                    message: 'Invalid types in productData',
                    code: ErrorCodes.INVALID_TYPES_ERROR,
                });
                return next(error);
            }

            const newProduct = await productService.addProduct(productData);
            logger.info('Producto agregado correctamente', { newProduct });
            res.status(201).json(newProduct);
        } catch (error) {
            logger.error('Error al agregar producto', { error });
            next(CustomError.createError({
                name: 'Database Error',
                cause: error,
                message: 'Error al agregar producto',
                code: ErrorCodes.DATABASE_ERROR,
            }));
        }
    }

    async updateProduct(req, res, next) {
        try {
            const productId = req.params.id;
            const updatedProductData = req.body;
            await productService.updateProduct(productId, updatedProductData);
            logger.info('Producto actualizado correctamente', { productId });
            res.status(200).json({ message: 'Producto actualizado correctamente' });
        } catch (error) {
            logger.error('Error al actualizar el producto', { error });
            next(CustomError.createError({
                name: 'Database Error',
                cause: error,
                message: 'Error al actualizar el producto',
                code: ErrorCodes.DATABASE_ERROR,
            }));
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const productId = req.params.id;
            await productService.deleteProduct(productId);
            logger.info('Producto eliminado correctamente', { productId });
            res.status(200).json({ message: 'Producto eliminado correctamente' });
        } catch (error) {
            logger.error('Error al eliminar producto', { error });
            next(CustomError.createError({
                name: 'Database Error',
                cause: error,
                message: 'Error al eliminar producto',
                code: ErrorCodes.DATABASE_ERROR,
            }));
        }
    }
}

module.exports = new ProductController();
