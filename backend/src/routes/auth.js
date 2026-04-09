// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('telephone').trim().notEmpty().withMessage('Le téléphone est requis'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit avoir au moins 6 caractères'),
], register);

router.post('/login', [
  body('telephone').trim().notEmpty().withMessage('Le téléphone est requis'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
], login);

router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

module.exports = router;
