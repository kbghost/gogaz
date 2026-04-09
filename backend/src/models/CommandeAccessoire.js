const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  accessoire: { type: mongoose.Schema.Types.ObjectId, ref: 'Accessoire', required: true },
  nom:        { type: String, required: true },
  prix:       { type: Number, required: true },
  quantite:   { type: Number, required: true, min: 1 },
  imageUrl:   { type: String },
}, { _id: false });

const commandeAccSchema = new mongoose.Schema({
  numeroCommande: { type: String, unique: true },
  client:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  nomClient:      { type: String, required: true, trim: true },
  telephoneClient:{ type: String, required: true, trim: true },
  items:          { type: [itemSchema], required: true, validate: v => v.length > 0 },
  prixTotal:      { type: Number, required: true },
  description:    { type: String, trim: true },
  adresseLivraison:{ type: String, trim: true },
  localisation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  statut: {
    type: String,
    enum: ['en_attente','validee','en_livraison','livree','annulee'],
    default: 'en_attente',
  },
  livreur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  historiqueStatuts: [{ statut: String, date: { type: Date, default: Date.now } }],
}, { timestamps: true });

commandeAccSchema.pre('save', async function(next) {
  if (!this.numeroCommande) {
    const count = await mongoose.model('CommandeAccessoire').countDocuments();
    const d = new Date();
    const yy = d.getFullYear().toString().slice(-2);
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    this.numeroCommande = `ACC-${yy}${mm}${dd}-${String(count+1).padStart(4,'0')}`;
  }
  if (this.isModified('statut')) {
    this.historiqueStatuts.push({ statut: this.statut });
  }
  next();
});

module.exports = mongoose.model('CommandeAccessoire', commandeAccSchema);
