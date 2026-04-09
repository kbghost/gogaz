const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { uploaders } = require('../middleware/upload');
const { getProduits, getProduit, createProduit, updateProduit, deleteProduit, getMarques } = require('../controllers/produitController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getProduits);
router.get('/marques', getMarques);
router.get('/:id', getProduit);

// Admin - avec upload image optionnel
router.post('/',
  protect, authorize('admin'),
  uploaders.produits.single('image'),
  [
    body('marque').notEmpty().withMessage('La marque est requise'),
    body('poids').isIn([3, 6, 12.5, 25]).withMessage('Poids invalide'),
    body('prix').isNumeric().withMessage('Prix invalide'),
  ],
  createProduit
);
router.put('/:id', protect, authorize('admin'), uploaders.produits.single('image'), updateProduit);
router.delete('/:id', protect, authorize('admin'), deleteProduit);

module.exports = router;
