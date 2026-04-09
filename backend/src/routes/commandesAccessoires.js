const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCommande, getCommandes, getMesCommandes,
  trackCommande, updateStatut,
} = require('../controllers/commandeAccController');

// Public
router.post('/', createCommande); // Anonymous allowed
router.get('/track/:numero', trackCommande);

// Protected
router.get('/mes-commandes', protect, authorize('client'), getMesCommandes);
router.get('/', protect, authorize('admin', 'livreur'), getCommandes);
router.put('/:id/statut', protect, authorize('admin', 'livreur'), updateStatut);

module.exports = router;
