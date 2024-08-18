const express = require('express');
const { productModel, isValidProductData } = require('../dao/models/product.js');
const router = express.Router();
const productController = require('../controllers/productController');
const  authorize  = require('../middlewares/authJWT.js');
const passport = require('passport');
const nodemailer = require('nodemailer');
router.post('/productos',
    passport.authenticate("jwt", { session: false }),
    authorize("admin", "premium"),
    async (req, res) => {
        try {
            // Asegúrate de que esta lógica no dependa del carrito de compras
            console.log('Datos recibidos:', req.body);

            const productData = {
                title: req.body.title,
                description: req.body.description,
                code: req.body.code,
                price: parseFloat(req.body.price),
                status: req.body.status === 'true',
                stock: parseInt(req.body.stock, 10),
                category: req.body.category,
                owner: req.user.role || 'admin'  // Esto asigna el rol actual como owner
            };

            console.log('Datos procesados:', productData);

            // Validar los datos antes de guardar
            if (isNaN(productData.price) || isNaN(productData.stock)) {
                return res.status(400).send('Precio o stock inválidos');
            }

            // Guardar el producto en la base de datos
            const nuevoProducto = new productModel(productData);
            await nuevoProducto.save();

            res.json({ status: 'success', message: 'Producto guardado con éxito' });
        } catch (error) {
            console.error('Error al subir producto:', error);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }
);
router.put('/:pid', authorize('admin'), async (req, res) => {
    const productId = req.params.pid;
    const updatedData = req.body;
    try {
        const updatedProduct = await productController.updateProduct(productId, updatedData);
        if (!updatedProduct) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json(updatedProduct);
        }
    } catch (error) {
        if (error.code === 'INVALID_TYPES_ERROR' || error.code === 'DATABASE_ERROR') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
})



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const sendEmail = async (to, subject, htmlContent) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: htmlContent
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return info;
    } catch (err) {
      console.error('Error sending email:', err.message);
      throw err;
    }
  };

router.delete('/:pid', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const productId = req.params.pid;
    try {
        const isPremium = req.user.role === 'premium';
        const userEmail = req.user.email;

        const product = await productController.getProductById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (isPremium && product.owner !== userEmail) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar este producto' });
        }

        const deletedProduct = await productController.deleteProduct(productId);

        if (!deletedProduct) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            // Enviar correo de notificación al propietario del producto
            const ownerEmail = product.owner;  // Suponiendo que el campo 'owner' contiene el email del propietario
            const mailOptions = {
                from: 'tu-email@example.com',
                to: ownerEmail,
                subject: 'Producto Eliminado',
                text: `Tu producto con ID ${productId} ha sido eliminado del sistema.`
            };

            sendmailer.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar correo:', error);
                } else {
                    console.log('Correo enviado:', info.response);
                }
            });

            res.json({ message: 'Producto eliminado correctamente y notificación enviada' });
        }
    } catch (error) {
        if (error.code === 'DATABASE_ERROR') {
            res.status(500).json({ error: 'Error al eliminar producto en la base de datos' });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
});

module.exports = router;
