const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  titre: {
    type: String,
    trim: true,
    maxlength: [100, 'Titre trop long'],
  },
  sousTitre: {
    type: String,
    trim: true,
    maxlength: [200, 'Sous-titre trop long'],
  },
  imageUrl: {
    type: String,
    required: [true, 'L\'image est requise'],
  },
  lien: {
    type: String,
    trim: true,
    default: '/commander',
  },
  labelBouton: {
    type: String,
    trim: true,
    default: 'Commander',
  },
  ordre: {
    type: Number,
    default: 0,
  },
  actif: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

sliderSchema.index({ ordre: 1 });

module.exports = mongoose.model('Slider', sliderSchema);
