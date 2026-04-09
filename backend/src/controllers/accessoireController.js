const Accessoire = require('../models/Accessoire');
const { deleteUploadedFile } = require('../middleware/upload');
const { validationResult } = require('express-validator');

// @desc  Get all accessoires (public)
// @route GET /api/accessoires
exports.getAccessoires = async (req, res) => {
  try {
    const { categorie, disponible, page = 1, limit = 20 } = req.query;
    const query = {};
    if (categorie) query.categorie = categorie;
    if (disponible !== undefined) query.disponible = disponible === 'true';

    const [accessoires, total] = await Promise.all([
      Accessoire.find(query)
        .sort({ categorie: 1, nom: 1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      Accessoire.countDocuments(query),
    ]);

    res.json({
      success: true,
      accessoires,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc  Get one accessoire
// @route GET /api/accessoires/:id
exports.getAccessoire = async (req, res) => {
  try {
    const acc = await Accessoire.findById(req.params.id);
    if (!acc) return res.status(404).json({ success: false, message: 'Accessoire introuvable.' });
    res.json({ success: true, accessoire: acc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc  Get categories list
// @route GET /api/accessoires/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Accessoire.distinct('categorie');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc  Create accessoire
// @route POST /api/accessoires
exports.createAccessoire = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) deleteUploadedFile(`/uploads/accessoires/${req.file.filename}`);
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { nom, description, categorie, prix, stock, disponible, reference } = req.body;

    const imageUrl = req.file
      ? `/uploads/accessoires/${req.file.filename}`
      : (req.body.imageUrl || null);

    const acc = await Accessoire.create({
      nom, description, categorie,
      prix: Number(prix),
      stock: Number(stock) || 0,
      imageUrl, reference,
      disponible: disponible !== 'false',
    });

    res.status(201).json({ success: true, message: 'Accessoire créé', accessoire: acc });
  } catch (err) {
    if (req.file) deleteUploadedFile(`/uploads/accessoires/${req.file.filename}`);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Référence déjà utilisée.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

// @desc  Update accessoire
// @route PUT /api/accessoires/:id
exports.updateAccessoire = async (req, res) => {
  try {
    const acc = await Accessoire.findById(req.params.id);
    if (!acc) return res.status(404).json({ success: false, message: 'Accessoire introuvable.' });

    const { nom, description, categorie, prix, stock, disponible, reference } = req.body;

    if (req.file) {
      if (acc.imageUrl && acc.imageUrl.startsWith('/uploads/')) {
        deleteUploadedFile(acc.imageUrl);
      }
      acc.imageUrl = `/uploads/accessoires/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      acc.imageUrl = req.body.imageUrl || null;
    }

    if (nom !== undefined) acc.nom = nom;
    if (description !== undefined) acc.description = description;
    if (categorie !== undefined) acc.categorie = categorie;
    if (prix !== undefined) acc.prix = Number(prix);
    if (stock !== undefined) acc.stock = Number(stock);
    if (reference !== undefined) acc.reference = reference;
    if (disponible !== undefined) acc.disponible = disponible === 'true' || disponible === true;

    await acc.save();
    res.json({ success: true, message: 'Accessoire mis à jour', accessoire: acc });
  } catch (err) {
    if (req.file) deleteUploadedFile(`/uploads/accessoires/${req.file.filename}`);
    res.status(500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

// @desc  Delete accessoire
// @route DELETE /api/accessoires/:id
exports.deleteAccessoire = async (req, res) => {
  try {
    const acc = await Accessoire.findById(req.params.id);
    if (!acc) return res.status(404).json({ success: false, message: 'Accessoire introuvable.' });

    if (acc.imageUrl && acc.imageUrl.startsWith('/uploads/')) {
      deleteUploadedFile(acc.imageUrl);
    }
    await acc.deleteOne();
    res.json({ success: true, message: 'Accessoire supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
