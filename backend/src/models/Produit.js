const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  marque: {
    type: String,
    required: [true, 'La marque est requise'],
    trim: true,
  },
  poids: {
    type: Number,
    required: [true, 'Le poids est requis'],
    enum: [3, 6, 12.5, 25],
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Prix invalide'],
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  disponible: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description trop longue'],
  },
  couleur: {
    type: String,
    default: '#f97c0a',
  },
  // URL image réelle (upload local ou URL externe)
  imageUrl: {
    type: String,
    default: null,
  },
}, { timestamps: true });

produitSchema.index({ marque: 1, poids: 1 }, { unique: true });

module.exports = mongoose.model('Produit', produitSchema);
