const nodemailer = require('nodemailer');
const User = require ('../dao/models/user.js');
const passport = require ('passport')
const authorize = require('../middlewares/authJWT.js');
const { Router } = require('express');
const upload = require('../middlewares/multerConfig.js');
const router = Router();
require('dotenv').config();

router.patch('/premium/:uid', passport.authenticate("jwt", { session: false }), authorize("admin"), async (req, res) => {
  try {
      const user = await User.findById(req.params.uid);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

     
      const newRole = req.body.role;

      if (newRole === 'premium') {
          if (user.documents.length < 3) {
              return res.status(400).json({ message: 'User must have at least 3 documents to become premium' });
          }
      }

      user.role = newRole;
      await user.save();
      res.status(200).json({ message: 'User role updated', user });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});
  
 
  router.post('/:uid/documents', upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'product', maxCount: 1 },
    { name: 'document', maxCount: 10 }
  ]), async (req, res) => {
    try {
      const userId = req.params.uid;
      console.log('UserId:', userId);

  
      const files = req.files;
      if (!files || !files.document) {
        return res.status(400).json({ message: 'No se subieron archivos de documentos' });
      }
  
     
      const user = await User.findById(userId);
      console.log("Usuario:", user);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      const documentEntries = [];

      if (files.profile) {
        documentEntries.push(...files.profile.map(file => ({
          name: file.originalname,
          reference: `/uploads/profiles/${file.filename}`
        })));
      }
  
      if (files.product) {
        documentEntries.push(...files.product.map(file => ({
          name: file.originalname,
          reference: `/uploads/products/${file.filename}`
        })));
      }
  
      if (files.document) {
        documentEntries.push(...files.document.map(file => ({
          name: file.originalname,
          reference: `/uploads/documents/${file.filename}`
        })));
      }
  
     
      user.documents = [...user.documents, ...documentEntries];
      await user.save();
  
  
      res.status(200).json({ message: 'Archivos subidos y datos guardados en la base de datos', files });
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ message: 'Error al subir archivos', error });
    }
  });
  
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
  
  router.delete('/inactive', passport.authenticate("jwt", { session: false }), authorize("admin"), async (req, res) => {
    try {
      const currentTime = new Date();
      const inactiveSince = new Date(currentTime.getTime() - 30 * 60 * 1000); // 30 minutos
      console.log('Current Time:', currentTime);
      console.log('Inactive Since:', inactiveSince);
  
      const inactiveUsers = await User.find({ last_connection: { $lt: inactiveSince } }).lean();
      console.log('Inactive Users:', inactiveUsers);
  
      if (!inactiveUsers || inactiveUsers.length === 0) {
        return res.status(404).json({ message: 'No inactive users found' });
      }
  
      for (const user of inactiveUsers) {
        console.log('Deleting user:', user.email);
  
        const htmlContent = `
          <h2>Account Deletion</h2>
          <p>Your account has been deleted due to inactivity.</p>
        `;
  
        await sendEmail(user.email, 'Account Deletion Due to Inactivity', htmlContent);
  
        await User.findByIdAndDelete(user._id);
      }
  
      res.status(200).json({ message: `${inactiveUsers.length} inactive users deleted and notified.` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
module.exports = router;