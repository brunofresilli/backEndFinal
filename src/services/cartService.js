const CartRepository = require('../repositories/cartRepository');
const logger = require('../utils/logger.js');

class CartService {
    
  
    async getCartProducts(cartId) {
        try {
          console.log('Service: getCartProducts called');
          const cart = await CartRepository.getCartById(cartId);
          return cart ? cart.products : [];
        } catch (error) {
          console.error('Service error:', error.message);
          throw new Error(`Products not found in cart ${cartId}`);
        }
      }
  async addProductToCart(cartid, productId, quantity) {
    return await CartRepository.addProductToCart(
      cartid,
      productId,
      quantity
    );
  }

    async createCart() {
        return await CartRepository.createCart();
      }

    async updateCart(cartId, products) {
        try {
            const updatedCart = await CartRepository.updateCart(cartId, products);
            logger.info('Carrito actualizado correctamente', { cartId });
            return updatedCart;
        } catch (error) {
            logger.error('Error al actualizar carrito', { cartId, error });
            throw new Error('Error al actualizar carrito');
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await CartRepository.getCartById(cartId);
            if (!cart) {
                return null;
            }

            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
            if (productIndex === -1) {
                return null;
            }

            cart.products[productIndex].quantity = quantity;
            const updatedCart = await CartRepository.updateCart(cart._id, cart.products);
            logger.info('Cantidad de producto actualizada en el carrito', { cartId, productId, quantity });
            return updatedCart;
        } catch (error) {
            logger.error('Error al actualizar cantidad de producto en el carrito', { cartId, productId, quantity, error });
            throw new Error('Error al actualizar cantidad de producto en el carrito');
        }
    }

   
  async deleteCart(id) {
    return await CartRepository.deleteCart(id);
}
async deleteProductFromCart(cartId, productId) {
    return await CartRepository.deleteProductFromCart(cartId, productId);
       
        }
    }

module.exports = new CartService();
