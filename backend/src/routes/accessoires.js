const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { uploaders } = require('../middleware/upload');
const {
  getAccessoires, getAccessoire, getCategories,
  createAccessoire, updateAccessoire, deleteAccessoire,
} = require('../controllers/accessoireController');
const { protect, authorize } = require('../middleware/auth');

const validateAccessoire = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('prix').isNumeric().withMessage('Prix invalide'),
  body('categorie').notEmpty().withMessage('La catégorie est requise'),
];

// Public
router.get('/', getAccessoires);
router.get('/categories', getCategories);
router.get('/:id', getAccessoire);

// Admin only
router.post('/', protect, authorize('admin'), uploaders.accessoires.single('image'), validateAccessoire, createAccessoire);
router.put('/:id', protect, authorize('admin'), uploaders.accessoires.single('image'), updateAccessoire);
router.delete('/:id', protect, authorize('admin'), deleteAccessoire);

module.exports = router;
