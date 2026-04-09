const Produit = require('../models/Produit');
const { deleteUploadedFile } = require('../middleware/upload');
const { validationResult } = require('express-validator');

exports.getProduits = async (req, res) => {
  try {
    const { marque, disponible } = req.query;
    const query = {};
    if (marque) query.marque = marque;
    if (disponible !== undefined) query.disponible = disponible === 'true';
    const produits = await Produit.find(query).sort({ marque: 1, poids: 1 });
    res.json({ success: true, produits });
  } catch (e) { res.status(500).json({ success: false, message: 'Erreur serveur.' }); }
};

exports.getProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    res.json({ success: true, produit });
  } catch (e) { res.status(500).json({ success: false, message: 'Erreur serveur.' }); }
};

exports.createProduit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) deleteUploadedFile('/uploads/produits/' + req.file.filename);
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const data = { ...req.body };
    data.prix = Number(data.prix);
    data.stock = Number(data.stock) || 0;
    data.poids = Number(data.poids);
    if (req.file) data.imageUrl = '/uploads/produits/' + req.file.filename;
    else if (data.imageUrl === '') data.imageUrl = null;
    const produit = await Produit.create(data);
    res.status(201).json({ success: true, message: 'Produit créé', produit });
  } catch (e) {
    if (req.file) deleteUploadedFile('/uploads/produits/' + req.file.filename);
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Produit (marque+poids) déjà existant.' });
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.updateProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    const data = { ...req.body };
    if (data.prix) data.prix = Number(data.prix);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.poids) data.poids = Number(data.poids);
    if (req.file) {
      if (produit.imageUrl && produit.imageUrl.startsWith('/uploads/')) deleteUploadedFile(produit.imageUrl);
      data.imageUrl = '/uploads/produits/' + req.file.filename;
    } else if (data.imageUrl === '') {
      if (produit.imageUrl && produit.imageUrl.startsWith('/uploads/')) deleteUploadedFile(produit.imageUrl);
      data.imageUrl = null;
    }
    const updated = await Produit.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, message: 'Produit mis à jour', produit: updated });
  } catch (e) {
    if (req.file) deleteUploadedFile('/uploads/produits/' + req.file.filename);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.deleteProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    if (produit.imageUrl && produit.imageUrl.startsWith('/uploads/')) deleteUploadedFile(produit.imageUrl);
    await produit.deleteOne();
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (e) { res.status(500).json({ success: false, message: 'Erreur serveur.' }); }
};

exports.getMarques = async (req, res) => {
  try {
    const marques = await Produit.distinct('marque');
    res.json({ success: true, marques });
  } catch (e) { res.status(500).json({ success: false, message: 'Erreur serveur.' }); }
};
