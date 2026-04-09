const CommandeAcc = require('../models/CommandeAccessoire');
const Accessoire  = require('../models/Accessoire');

// POST /api/commandes-accessoires — create order
exports.createCommande = async (req, res) => {
  try {
    const { nomClient, telephoneClient, items, description, localisation, adresseLivraison } = req.body;

    if (!nomClient || !telephoneClient) return res.status(400).json({ success: false, message: 'Nom et téléphone requis.' });
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Panier vide.' });
    if (!localisation?.lat) return res.status(400).json({ success: false, message: 'Localisation requise.' });

    // Verify stock and build items
    let prixTotal = 0;
    const resolvedItems = [];
    for (const item of items) {
      const acc = await Accessoire.findById(item.accessoireId);
      if (!acc) return res.status(404).json({ success: false, message: `Accessoire introuvable: ${item.accessoireId}` });
      if (!acc.disponible) return res.status(400).json({ success: false, message: `${acc.nom} n'est plus disponible.` });
      if (acc.stock < item.quantite) return res.status(400).json({ success: false, message: `Stock insuffisant pour ${acc.nom}.` });
      resolvedItems.push({ accessoire: acc._id, nom: acc.nom, prix: acc.prix, quantite: item.quantite, imageUrl: acc.imageUrl || null });
      prixTotal += acc.prix * item.quantite;
    }

    const commandeData = {
      nomClient, telephoneClient, items: resolvedItems,
      prixTotal, description, localisation, adresseLivraison,
      historiqueStatuts: [{ statut: 'en_attente' }],
    };
    if (req.user) commandeData.client = req.user._id;

    const commande = await CommandeAcc.create(commandeData);

    // Emit socket
    const io = req.app.get('io');
    if (io) io.to('admins').emit('nouvelle_commande_acc', commande);

    res.status(201).json({ success: true, message: 'Commande passée !', commande });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

// GET /api/commandes-accessoires — list (admin)
exports.getCommandes = async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const query = statut ? { statut } : {};
    const commandes = await CommandeAcc.find(query)
      .populate('client', 'nom telephone')
      .populate('livreur', 'nom telephone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page)-1) * Number(limit));
    const total = await CommandeAcc.countDocuments(query);
    res.json({ success: true, commandes, pagination: { total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// GET /api/commandes-accessoires/mes-commandes (client)
exports.getMesCommandes = async (req, res) => {
  try {
    const commandes = await CommandeAcc.find({ client: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, commandes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// GET /api/commandes-accessoires/track/:numero
exports.trackCommande = async (req, res) => {
  try {
    const commande = await CommandeAcc.findOne({ numeroCommande: req.params.numero })
      .populate('livreur', 'nom telephone');
    if (!commande) return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    res.json({ success: true, commande });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// PUT /api/commandes-accessoires/:id/statut (admin/livreur)
exports.updateStatut = async (req, res) => {
  try {
    const { statut, livreurId } = req.body;
    const commande = await CommandeAcc.findById(req.params.id);
    if (!commande) return res.status(404).json({ success: false, message: 'Introuvable.' });
    commande.statut = statut;
    if (livreurId) commande.livreur = livreurId;
    else if (statut === 'en_livraison' && !commande.livreur) commande.livreur = req.user._id;
    await commande.save();
    const io = req.app.get('io');
    if (io) io.to(`commande_acc_${commande._id}`).emit('statut_update_acc', { commandeId: commande._id, statut });
    res.json({ success: true, commande });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
