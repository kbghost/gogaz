const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createCommande, getCommandes, getCommande, trackCommande,
  updateStatut, updatePosition, getMesCommandes,
} = require('../controllers/commandeController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.post('/', [
  body('nomClient').trim().notEmpty().withMessage('Le nom est requis'),
  body('telephoneClient').trim().notEmpty().withMessage('Le téléphone est requis'),
  body('produitId').notEmpty().withMessage('Le produit est requis'),
  body('quantite').isInt({ min: 1, max: 20 }).withMessage('Quantité invalide'),
  body('localisation.lat').isNumeric().withMessage('Latitude invalide'),
  body('localisation.lng').isNumeric().withMessage('Longitude invalide'),
], createCommande);

router.get('/track/:numero', trackCommande);

// Protected
router.get('/mes-commandes', protect, authorize('client'), getMesCommandes);
router.get('/', protect, authorize('admin', 'livreur'), getCommandes);
router.get('/:id', protect, getCommande);
router.put('/:id/statut', protect, authorize('admin', 'livreur'), updateStatut);
router.put('/:id/position', protect, authorize('livreur'), updatePosition);

module.exports = router;
