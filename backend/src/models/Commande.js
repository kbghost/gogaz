const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  numeroCommande: {
    type: String,
    unique: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow anonymous orders
  },
  nomClient: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true,
  },
  telephoneClient: {
    type: String,
    required: [true, 'Le téléphone du client est requis'],
    trim: true,
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: [true, 'Le produit est requis'],
  },
  marque: { type: String, required: true },
  poids: { type: Number, required: true },
  quantite: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité minimum est 1'],
    max: [20, 'La quantité maximum est 20'],
  },
  prixUnitaire: { type: Number, required: true },
  prixTotal: { type: Number, required: true },
  description: { type: String, trim: true },
  adresseLivraison: {
    type: String,
    trim: true,
  },
  localisation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    adresseFormatee: String,
  },
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'en_livraison', 'livree', 'annulee'],
    default: 'en_attente',
  },
  livreur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  localisationLivreur: {
    lat: Number,
    lng: Number,
  },
  historiqueStatuts: [{
    statut: String,
    date: { type: Date, default: Date.now },
    note: String,
  }],
  dateValidation: Date,
  dateEnLivraison: Date,
  dateLivraison: Date,
}, { timestamps: true });

// Auto-generate order number
commandeSchema.pre('save', async function(next) {
  if (!this.numeroCommande) {
    const count = await mongoose.model('Commande').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.numeroCommande = `GAZ-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Track status changes
  if (this.isModified('statut')) {
    this.historiqueStatuts.push({ statut: this.statut });
    if (this.statut === 'validee') this.dateValidation = new Date();
    if (this.statut === 'en_livraison') this.dateEnLivraison = new Date();
    if (this.statut === 'livree') this.dateLivraison = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Commande', commandeSchema);
