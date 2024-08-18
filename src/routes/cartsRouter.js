const { Router } = require('express');
const passport = require('passport');
const authorize = require('../middlewares/authJWT');
const cartController = require('../controllers/cartController.js');
const productController = require('../controllers/productController.js');
const logger = require('../utils/logger');


const router = Router();


router.post('/', 
    passport.authenticate('jwt', { session: false }),
    authorize('user','premium'),
    (req, res) => cartController.createCart(req, res)
);

router.post("/:cid/products/:pid", 
  passport.authenticate('jwt', { session: false }),
    authorize('user','premium'),
  async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
  
      const isPremium = req.user.role === 'premium';
      const userEmail = req.user.email;

      const product = await productController.getProductById(productId);


      if (product && isPremium && product.owner === userEmail) {
        return res.status(403).json({ error: 'No puedes agregar a tu carrito un producto que te pertenece' });
      }
        

      await cartController.addProductToCart(cartId, productId, quantity);

      res.send({
        status: "success",
        message: "Product has been added successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(400).send({
        status: "error",
        error: "There was an error adding the product to the cart",
      });
    }
  });
router.put('/:cid', 
    passport.authenticate('jwt', { session: false }),
    authorize('user','premium'),
    (req, res) => cartController.updateCart(req, res)
);

router.put("/:cid/products/:pid", 
  passport.authenticate('jwt', { session: false }),
  authorize('user','premium'), async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;
    try {
      await cartController.updateProductQuantity(cartId, productId, quantity);
      res.send({ status: "success", message: "Quantity changed" });
    } catch (error) {
      console.error(error);
      res.status(400).send({
        status: "error",
        error: "There was an error updating the product quantity",
      });
    }
  });

router.delete('/:cid', 
    passport.authenticate('jwt', { session: false }),
    authorize('user', 'premium'),
    (req, res) => cartController.deleteCart(req, res)
);

router.delete('/:cid/products/:pid', 
    passport.authenticate('jwt', { session: false }),
    authorize('user','premium'),
    async (req, res) => {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      try {
        await cartController.deleteProductFromCart(cartId, productId);
        res.send(`Product ${productId} has been deleted from the cart`);
      } catch (error) {
        console.error(error);
        res.status(400).send({
          status: "error",
          error: "There was an error deleting the product from the cart",
        });
      }
    });
    
    
    router.post('/:cid/purchase', passport.authenticate('jwt', { session: false }), async (req, res) => {
      try {
          const cartId = req.params.cid;
          const purchaser = req.user.email;
  
          
          const cart = await cartController.getCartProducts(cartId);
  
          
          if (!cart.products || cart.products.length === 0) {
              return res.status(400).send({
                  status: 'error',
                  message: 'El carrito está vacío, no se puede generar un ticket.',
              });
          }
  
          
          for (const item of cart.products) {
              const product = await productController.getProductById(item.product._id);
              if (product.stock < item.quantity) {
                  return res.status(400).send({
                      status: 'error',
                      message: `No hay suficiente stock para el producto: ${product.name}`,
                  });
              }
          }
  

          const result = await cartController.finalizePurchase(cartId, purchaser);
          res.redirect(`/purchase/${result.ticket._id}`);
      } catch (error) {
          res.status(400).send({
              status: 'error',
              message: error.message,
          });
      }
  });
module.exports = router;
