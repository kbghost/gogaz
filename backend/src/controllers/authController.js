const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { nom, telephone, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ telephone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Ce numéro est déjà utilisé.' });
    }

    const user = await User.create({ nom, telephone, email, password, role: 'client' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du compte.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { telephone, password } = req.body;

  try {
    const user = await User.findOne({ telephone }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Numéro ou mot de passe incorrect.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Numéro ou mot de passe incorrect.' });
    }

    if (!user.actif) {
      return res.status(401).json({ success: false, message: 'Compte désactivé. Contactez l\'admin.' });
    }

    user.dernierConnexion = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion.' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Update password
// @route   PUT /api/auth/password
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Mot de passe mis à jour.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour.' });
  }
};
