const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// POST /api/notifications/subscribe
router.post('/subscribe', async (req, res) => {
  const { orderId, subscription } = req.body;

  if (!orderId || !subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Missing orderId or subscription' });
  }

  try {
    // On remplace l'abonnement existant pour cette commande (si changement de navigateur)
    await Subscription.findOneAndUpdate(
      { orderId },
      { endpoint: subscription.endpoint, keys: subscription.keys },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: 'Subscription saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
