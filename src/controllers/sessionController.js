const nodemailer = require('nodemailer');
const User = require('../dao/models/user.js');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { createToken } = require('../utils/jwtUtils.js');
require('dotenv').config();
const logger = require('../utils/logger');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  
  }
});

const restoreRequest = async (req, res) => {
  const email = req.body.email;
  

  try {
      const user = await User.findOne({ email });

      if (!user) {
          
          return res.status(404).send({ status: "error", message: "Email no encontrado" });
      }

      const token = createToken({ email: email }, '1h'); 

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Restablecimiento de contraseña de cuenta',
          html: `
              <h2>Restablecimiento de contraseña de cuenta</h2>
              <p><b>Atención!</b>: si usted NO ha solicitado este mail, simplemente ignórelo</p>
              <p>Para generar una nueva clave en su cuenta, ingrese por favor al siguiente enlace:</p>
              <p><a href="http://localhost:8080/restoreConfirm?access_token=${token}">Restablecer contraseña</a></p>
          `
      };

      await transporter.sendMail(mailOptions);
      
      res.status(200).send({ status: "success", message: `Se ha enviado un correo a ${email} con instrucciones para restablecer la contraseña` });
  } catch (err) {
      
      res.status(500).send({ status: "error", message: "Error al enviar el correo", error: err.message });
  }
};

const restoreConfirm = async (req, res) => {
  const { access_token, password } = req.body;

  

  try {
      if (typeof access_token !== 'string') {
          logger.warn('Invalid JWT token type', { access_token });
          return res.status(400).send({ status: "error", message: "El token JWT proporcionado no es válido" });
      }

      const JWT_SECRET = process.env.JWT_SECRET; 
      const decoded = jwt.verify(access_token, JWT_SECRET); 
    

      const user = await User.findOne({ email: decoded.email });

      if (!user) {
          
          return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
      }

      const isSamePassword = await bcryptjs.compare(password, user.password);
      if (isSamePassword) {
          
          return res.status(400).send({ status: "error", message: "No puedes usar la misma contraseña" });
      }

      const hashedPassword = await bcryptjs.hash(password, 12);
      user.password = hashedPassword;
      await user.save();

      
      res.status(200).send({ status: "success", message: "Contraseña restablecida exitosamente" });
  } catch (err) {
      if (err.name === 'TokenExpiredError') {
         
          return res.status(400).send({ status: "error", message: "El enlace de restablecimiento ha expirado" });
      } else if (err.name === 'JsonWebTokenError') {
          
          return res.status(400).send({ status: "error", message: "El token JWT proporcionado no es válido" });
      }
logger.error('Error processing password reset request', { access_token, error: err.message });
      res.status(500).send({ status: "error", message: "Error al procesar la solicitud", error: err.message });
  }
};

module.exports = {  restoreRequest,
                    restoreConfirm}