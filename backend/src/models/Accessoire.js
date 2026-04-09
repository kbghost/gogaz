const mongoose = require('mongoose');

const accessoireSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [100, 'Nom trop long'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description trop longue'],
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['Détendeur', 'Tuyau', 'Briquet', 'Gazinière', 'Sécurité', 'Autre'],
    default: 'Autre',
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
  imageUrl: {
    type: String,
    default: null,
  },
  disponible: {
    type: Boolean,
    default: true,
  },
  reference: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
}, { timestamps: true });

accessoireSchema.index({ categorie: 1 });
accessoireSchema.index({ disponible: 1 });

module.exports = mongoose.model('Accessoire', accessoireSchema);
