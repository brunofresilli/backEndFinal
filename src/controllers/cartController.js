const cartService = require('../services/cartService');
const CustomError = require('../services/errors/CustomError.js');
const { ErrorCodes } = require('../services/errors/enums.js');
const { logger } = require('../utils/logger.js');
const Cart = require ('../dao/models/cart.js');
const Ticket = require ('../dao/models/ticket.js');
const crypto = require ('crypto');


class CartController {
  async createCart() {
      try {
          logger.info('Creating new cart');
          const newCart = await cartService.createCart();
          logger.info('Cart created successfully', { cartId: newCart._id });
          return newCart;
      } catch (error) {
          logger.error('Error creating cart', { error: error.message });
          throw new Error('Error creating cart');
      }
  }

  async getCartProducts(cartId) {
      try {
          logger.info('Fetching products for cart', { cartId });
          const products = await cartService.getCartProducts(cartId);
          logger.info('Products fetched successfully', { cartId, productsCount: products.length });
          return { products: products || [] };
      } catch (error) {
          logger.error('Error fetching products for cart', { cartId, error: error.message });
          throw new Error(`Products not found in cart ${cartId}`);
      }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
      try {
          logger.info('Adding product to cart', { cartId, productId, quantity });
          const result = await cartService.addProductToCart(cartId, productId, quantity);
          logger.info('Product added to cart successfully', { cartId, productId, quantity });
          return result;
      } catch (error) {
          logger.error('Error adding product to cart', { cartId, productId, error: error.message });
          throw new Error('Error adding product to cart');
      }
  }

  async updateCart(req, res, next) {
      try {
          const cartId = req.params.id;
          const { products } = req.body;
          logger.info('Updating cart', { cartId, products });
          const updatedCart = await cartService.updateCart(cartId, products);
          if (!updatedCart) {
              logger.warn(`Cart not found: ${cartId}`);
              throw CustomError.createError({
                  name: 'Cart Not Found',
                  cause: `Cart with ID ${cartId} not found`,
                  message: 'Cart not found',
                  code: ErrorCodes.CART_OPERATION_ERROR,
              });
          }
          logger.info('Cart updated successfully', { cartId });
          res.status(200).json(updatedCart);
      } catch (error) {
          logger.error('Error updating cart', { cartId, error: error.message });
          next(error);
      }
  }

  async updateProductQuantity(req, res, next) {
      try {
          const cartId = req.params.id;
          const { productId } = req.params;
          const { quantity } = req.body;
          logger.info('Updating product quantity in cart', { cartId, productId, quantity });
          const result = await cartService.updateProductQuantity(cartId, productId, quantity);
          logger.info('Product quantity updated successfully', { cartId, productId, quantity });
          res.status(200).json(result);
      } catch (error) {
          logger.error('Error updating product quantity in cart', { cartId, productId, error: error.message });
          next(CustomError.createError({
              name: 'Database Error',
              cause: error,
              message: 'Error updating product quantity in cart',
              code: ErrorCodes.DATABASE_ERROR,
          }));
      }
  }

  async deleteCart(id) {
      try {
          logger.info('Deleting cart', { cartId: id });
          const result = await cartService.deleteCart(id);
          logger.info('Cart deleted successfully', { cartId: id });
          return result;
      } catch (error) {
          logger.error('Error deleting cart', { cartId: id, error: error.message });
          throw new Error('Error deleting cart');
      }
  }

  async deleteProductFromCart(cartId, productId) {
      try {
          logger.info('Removing product from cart', { cartId, productId });
          const result = await cartService.deleteProductFromCart(cartId, productId);
          logger.info('Product removed from cart successfully', { cartId, productId });
          return result;
      } catch (error) {
          logger.error('Error removing product from cart', { cartId, productId, error: error.message });
          throw new Error('Error removing product from cart');
      }
  }

  finalizePurchase = async (cartId, purchaser) => {
      try {
          logger.info('Finalizing purchase', { cartId, purchaser });
          const cart = await Cart.findById(cartId).populate('products.product');
          if (!cart) {
              logger.warn('Cart not found', { cartId });
              throw new Error('Cart not found');
          }

          const productsNotPurchased = [];
          const purchasedProducts = [];
          let totalAmount = 0;

          for (const cartProduct of cart.products) {
              const product = cartProduct.product;
              const quantity = cartProduct.quantity;
              if (product.stock >= quantity) {
                  product.stock -= quantity;
                  await product.save();
                  purchasedProducts.push({
                      product: product._id,
                      quantity,
                  });
                  totalAmount += product.price * quantity;
              } else {
                  productsNotPurchased.push(product._id);
              }
          }

          const ticketCode = crypto.randomBytes(16).toString('hex');
          const ticket = await Ticket.create({
              code: ticketCode,
              products: purchasedProducts,
              purchase_datetime: new Date(),
              amount: totalAmount,
              purchaser: purchaser,
          });

          cart.products = cart.products.filter(cartProduct => productsNotPurchased.includes(cartProduct.product._id));
          await cart.save();

          logger.info('Purchase completed successfully', { cartId, purchaser, ticketCode });
          return {
              status: 'success',
              message: 'Purchase completed',
              ticket,
              productsNotPurchased,
          };
      } catch (error) {
          logger.error('Error finalizing purchase', { cartId, purchaser, error: error.message });
          throw new Error('Error finalizing purchase: ' + error.message);
      }
  };
}


    
module.exports = new CartController();
