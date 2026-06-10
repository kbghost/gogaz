const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true   // une seule subscription par commande
  },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: String,
    auth: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
