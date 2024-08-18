const CartDAO = require('../dao/cartDAO.js');
const CartDTO = require('../dao/dto/cartDTO.js');
const logger = require('../utils/logger.js'); 
const Cart = require('../dao/models/cart.js');

class CartRepository {
    async createCart() {
        try {
          const newCartDTO = new CartDTO({ products: [] });
          const newCart = await CartDAO.create(newCartDTO);
          return newCart;
        } catch (error) {
          console.error(error.message);
          throw new Error("Error creating cart");
        }
      }
      async getCartById(cartId) {
        try {
          return await CartDAO.getCartById(cartId);
        } catch (error) {
          throw new Error(`Error fetching cart with ID ${cartId}`);
        }
      }
    

    addProductToCart = async (cartid, productId, quantity) => {
      try {
        const cart = await CartDAO.addCart(cartid);
        if (!cart) throw new Error(`Cart with ID ${cartid} not found`);
    
        console.log("Cart retrieved:", cart);
    
      
        if (!Array.isArray(cart.products)) {
          cart.products = [];
        }
    
        cart.products = cart.products.map(product => {
          if (!product.product) {
            return { product: product._id, quantity: product.quantity || 1 };
          }
          return product;
        });
    
        const existingProduct = cart.products.find((product) => {
          return product.product.toString() === productId.toString();
        });
    
        console.log("Existing product:", existingProduct);
    
        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          
          cart.products.push({ product: productId, quantity });
        }
    
        await cart.save();
        return cart;
      } catch (error) {
        console.error('Error adding product to cart:', error.message);
        throw new Error("Error adding product to cart");
      }
    };
    async updateCart(cartId, products) {
        try {
            return await CartDAO.updateCart(cartId, products);
        } catch (error) {
            logger.error(`Error updating cart with ID ${cartId}: ${error.message}`);
            throw new Error(`Error updating cart with ID ${cartId}`);
        }
    }

    async deleteCart(id) {
      try {
        return await CartDAO.delete(id);
      } catch (error) {
        console.error(error.message);
        throw new Error("Error deleting cart");
      }
    }
    async deleteProductFromCart(cartId, productId) {
      try {
        return await CartDAO.deleteProduct(cartId, productId);
      } catch (error) {
        console.error(error.message);
        throw new Error("Error deleting product from cart");
      }
    }
    async getById(id) {
      console.log('Buscando cart por ID:', id);
      return Cart.findById(id).populate('products.product');
    }
  
    async update(cart) {
      console.log('Actualizando cart:', cart);
      return cart.save();
    }
  }
module.exports = new CartRepository();
