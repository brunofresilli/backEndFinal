const { Router } = require('express');
const  { productModel } = require ('../dao/models/product.js')
const authorize = require('../middlewares/authJWT.js');
const ProductController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const { generateFakeProduct } = require('../utils/fakerUtil.js')
const passport = require ('passport')
const { logger } = require('../utils/logger.js');
const Ticket = require ('../dao/models/ticket.js');
const { verifyToken } = require ('../utils/jwtUtils.js');
const User = require ('../dao/models/user.js');




const router = Router();


router.get('/restore', (req, res) => {
  res.render('restore', {
    title: 'Restaurar Contraseña',
    style: 'style.css'
  });
});

router.get('/restoreConfirm', verifyToken, (req, res) => {
  const { access_token } = req.query;
  console.log("access_token de la query:" ,access_token);
  res.render('restoreConfirm', { access_token });
});

router.get("/products",   
    passport.authenticate("jwt", { session: false }),
    authorize("user","premium"),
    async (req, res) => {
    
    
    let page = parseInt(req.query.page);
    if (!page) page = 1;

    const result = await productModel.paginate({}, { page, limit: 5, lean: true });
    const baseURL = "http://localhost:8080/products/";
    result.prevLink = result.hasPrevPage ? `${baseURL}?page=${result.prevPage}` : "";
    result.nextLink = result.hasNextPage ? `${baseURL}?page=${result.nextPage}` : "";
    result.isValid = !(page <= 0 || page > result.totalPages);

    res.render('products', {
        loggedIn: true, 
        username: req.user.email,
        title: 'ProductosHome',
        userId: req.user.cart, 
        style: 'style.css',
        result
    });
});





router.get("/login", (req, res) => {
    res.render(
        'login',
        {
            title: 'login',
            style: 'style.css',
          
        }
    )
});

router.get("/register", (req, res) => {
    res.render(
        'register',
        {
            title: 'register',
            style: 'style.css',
            failRegister: req.session.failRegister ?? false
        }
    )
});
router.get('/productos/nuevo', 
  passport.authenticate("jwt", { session: false }), 
  authorize("admin", "premium"), 
  (req, res) => {
      res.render('newProducts', {
          title: 'Cargar Nuevo Producto',
          style: 'style.css',
          username: req.user.username
      });
  }
);


      router.get('/users', passport.authenticate("jwt", { session: false }), authorize("admin"), async (req, res) => {
        try {
          const users = await User.find().lean();
          console.log("All users: ", users);
          if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
          }
          res.render('usersList', {
            title: 'Users List',
            style: 'style.css',
            users: users
          });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      });



router.get("/:cid",
    passport.authenticate("jwt", { session: false }),
   
    async (req, res) => {
      try {
        
        const result = await cartController.getCartProducts(req.params.cid);
        console.log(result);
        if (result && result.products.length > 0) {
            result.products.forEach(product => {
              product.totalValue = product.quantity * product.product.price;
            });
          }
        
        res.render('cart', {
          title: 'Carrito de Compras',
          style: 'style.css',
          result ,
          cartId:req.params.cid
        });
      } catch (error) {
        res.status(400).send({
          status: "error",
          message: error.message,
        });
      }
    }
  );
router.get("/unauthorized", (req, res) => {
    res.status(401).render("unauthorized", {
      title: "Unauthorized",
      style: "index.css",
    });
  });


router.get('/mockingproducts', (req, res) => {
    const products = [];

    for (let i = 0; i < 100; i++) {
        products.push(generateFakeProduct());
    }

    res.send({
        status: 'success',
        payload: products
    });
});

router.get('/loggerTest', (req, res) => {
    logger.fatal('Este es un mensaje fatal');
    logger.error('Este es un mensaje de error');
    logger.warning('Este es un mensaje de advertencia');
    logger.info('Este es un mensaje de información');
    logger.http('Este es un mensaje HTTP');
    logger.debug('Este es un mensaje de depuración');

    res.send('Logs probados con éxito');
});

router.post('/loggerTest', (req, res) => {
    logger.info('Se ha recibido una solicitud POST en /loggerTest');
    res.status(201).send('Solicitud POST procesada con éxito');
});
router.get('/purchase/:ticketId', async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId).populate('products.product').lean();

    if (!ticket) {
      return res.status(404).send({
        status: 'error',
        message: 'Ticket not found',
      });
    }
    
    res.render('ticket', 
      { ticket,
         style: 'style.css' 
        }); 
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/:uid/upload', async (req, res) => {
  const userId = req.params.uid;
  res.render('upload', 
    { userId ,
      title: 'upload',
      style: 'style.css',
  });
});

module.exports = router;