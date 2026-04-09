const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const { validationResult } = require('express-validator');

// @desc    Create commande
// @route   POST /api/commandes
exports.createCommande = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { nomClient, telephoneClient, produitId, quantite, description, localisation, adresseLivraison } = req.body;

  try {
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }
    if (!produit.disponible) {
      return res.status(400).json({ success: false, message: 'Ce produit n\'est pas disponible.' });
    }
    if (produit.stock < quantite) {
      return res.status(400).json({ success: false, message: `Stock insuffisant. Stock disponible: ${produit.stock}` });
    }

    const prixTotal = produit.prix * quantite;

    const commandeData = {
      nomClient,
      telephoneClient,
      produit: produit._id,
      marque: produit.marque,
      poids: produit.poids,
      quantite,
      prixUnitaire: produit.prix,
      prixTotal,
      description,
      localisation,
      adresseLivraison,
      historiqueStatuts: [{ statut: 'en_attente' }],
    };

    if (req.user) {
      commandeData.client = req.user._id;
    }

    const commande = await Commande.create(commandeData);
    await commande.populate('produit');

    // Emit to admin/livreurs via socket
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('nouvelle_commande', commande);
    }

    res.status(201).json({
      success: true,
      message: 'Commande passée avec succès',
      commande,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande.' });
  }
};

// @desc    Get all commandes (admin/livreur)
// @route   GET /api/commandes
exports.getCommandes = async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const query = {};

    if (statut) query.statut = statut;
    if (req.user.role === 'livreur') query.livreur = req.user._id;

    const commandes = await Commande.find(query)
      .populate('produit', 'marque poids prix couleur')
      .populate('client', 'nom telephone')
      .populate('livreur', 'nom telephone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Commande.countDocuments(query);

    res.json({
      success: true,
      commandes,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération.' });
  }
};

// @desc    Get commande by ID
// @route   GET /api/commandes/:id
exports.getCommande = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id)
      .populate('produit', 'marque poids prix couleur')
      .populate('client', 'nom telephone')
      .populate('livreur', 'nom telephone');

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    // Check access: client can only see own orders
    if (req.user && req.user.role === 'client' && commande.client?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    res.json({ success: true, commande });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur.' });
  }
};

// @desc    Get commande by numero (public tracking)
// @route   GET /api/commandes/track/:numero
exports.trackCommande = async (req, res) => {
  try {
    const commande = await Commande.findOne({ numeroCommande: req.params.numero })
      .populate('produit', 'marque poids prix couleur')
      .populate('livreur', 'nom telephone');

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    res.json({ success: true, commande });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur.' });
  }
};

// @desc    Update commande status
// @route   PUT /api/commandes/:id/statut
exports.updateStatut = async (req, res) => {
  const { statut, livreurId } = req.body;
  const validStatuts = ['validee', 'en_livraison', 'livree', 'annulee'];

  if (!validStatuts.includes(statut)) {
    return res.status(400).json({ success: false, message: 'Statut invalide.' });
  }

  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    commande.statut = statut;
    if (livreurId && statut === 'en_livraison') {
      commande.livreur = livreurId;
    }
    if (statut === 'en_livraison' && !commande.livreur) {
      commande.livreur = req.user._id;
    }

    await commande.save();
    await commande.populate('produit client livreur');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`commande_${commande._id}`).emit('statut_update', {
        commandeId: commande._id,
        statut: commande.statut,
        commande,
      });
      io.to('admins').emit('commande_update', commande);
    }

    res.json({ success: true, message: 'Statut mis à jour', commande });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur.' });
  }
};

// @desc    Update livreur position
// @route   PUT /api/commandes/:id/position
exports.updatePosition = async (req, res) => {
  const { lat, lng } = req.body;

  try {
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { localisationLivreur: { lat, lng } },
      { new: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`commande_${commande._id}`).emit('livreur_position', { lat, lng, commandeId: commande._id });
    }

    res.json({ success: true, message: 'Position mise à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur.' });
  }
};

// @desc    Get my commandes (client)
// @route   GET /api/commandes/mes-commandes
exports.getMesCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find({ client: req.user._id })
      .populate('produit', 'marque poids prix couleur')
      .populate('livreur', 'nom telephone')
      .sort({ createdAt: -1 });

    res.json({ success: true, commandes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur.' });
  }
};
