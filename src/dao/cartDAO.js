const Cart = require('../dao/models/cart.js');

class CartDAO {
  async create() {
    return await Cart.create({ products: [] });
  }

  async getCartById(cartId) {
    try {
      console.log('DAO: getCartById called');
      return await Cart.findById(cartId).populate('products.product').lean();
    } catch (error) {
      console.error('DAO error:', error.message);
      throw new Error(`Error fetching cart with ID ${cartId}`);
    }
  }


    async updateCart(cartId, products) {
        return await Cart.findByIdAndUpdate(cartId, { products }, { new: true }).populate('products.Product');
    }

    
    addCart = async (cartid) => {
      try {
        const cart = await Cart.findOne({ _id: cartid });
        if (!cart) throw new Error(`Cart with ID ${cartid} not found`);
    
      
        if (!Array.isArray(cart.products)) {
          cart.products = [];
        }
    
       
        cart.products = cart.products.map(product => {
          if (!product.product) {
            return { product: product._id, quantity: product.quantity || 1 };
          }
          return product;
        });
    
        return cart;
      } catch (error) {
        console.error('Error retrieving cart:', error.message);
        throw error;
      }
    };
    async delete(id) {
      return await Cart.deleteOne({ _id: id });
    }
  
  async deleteProduct(cartId, productId) {
    return await Cart.findOneAndUpdate(
      { _id: cartId },
      { $pull: { products: { product: productId } } }
    );
  }
}

module.exports = new CartDAO();
