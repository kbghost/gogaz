const Slider = require('../models/Slider');
const { deleteUploadedFile } = require('../middleware/upload');

// @desc  Get all slides (public - only active, sorted)
// @route GET /api/slider
exports.getSlides = async (req, res) => {
  try {
    const { all } = req.query;
    const query = all === 'true' ? {} : { actif: true };
    const slides = await Slider.find(query).sort({ ordre: 1, createdAt: 1 });
    res.json({ success: true, slides });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc  Create a slide
// @route POST /api/slider
exports.createSlide = async (req, res) => {
  try {
    const { titre, sousTitre, lien, labelBouton, ordre, actif } = req.body;

    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({ success: false, message: 'Une image est requise.' });
    }

    const imageUrl = req.file
      ? `/uploads/slider/${req.file.filename}`
      : req.body.imageUrl;

    const slide = await Slider.create({
      titre, sousTitre, imageUrl, lien, labelBouton,
      ordre: Number(ordre) || 0,
      actif: actif !== 'false',
    });

    res.status(201).json({ success: true, message: 'Slide créé', slide });
  } catch (err) {
    if (req.file) deleteUploadedFile(`/uploads/slider/${req.file.filename}`);
    res.status(500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

// @desc  Update a slide
// @route PUT /api/slider/:id
exports.updateSlide = async (req, res) => {
  try {
    const slide = await Slider.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide introuvable.' });

    const { titre, sousTitre, lien, labelBouton, ordre, actif } = req.body;

    // If new file uploaded, delete old one
    if (req.file) {
      if (slide.imageUrl && slide.imageUrl.startsWith('/uploads/')) {
        deleteUploadedFile(slide.imageUrl);
      }
      slide.imageUrl = `/uploads/slider/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      slide.imageUrl = req.body.imageUrl;
    }

    if (titre !== undefined) slide.titre = titre;
    if (sousTitre !== undefined) slide.sousTitre = sousTitre;
    if (lien !== undefined) slide.lien = lien;
    if (labelBouton !== undefined) slide.labelBouton = labelBouton;
    if (ordre !== undefined) slide.ordre = Number(ordre);
    if (actif !== undefined) slide.actif = actif === 'true' || actif === true;

    await slide.save();
    res.json({ success: true, message: 'Slide mis à jour', slide });
  } catch (err) {
    if (req.file) deleteUploadedFile(`/uploads/slider/${req.file.filename}`);
    res.status(500).json({ success: false, message: err.message || 'Erreur serveur.' });
  }
};

// @desc  Delete a slide
// @route DELETE /api/slider/:id
exports.deleteSlide = async (req, res) => {
  try {
    const slide = await Slider.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide introuvable.' });

    if (slide.imageUrl && slide.imageUrl.startsWith('/uploads/')) {
      deleteUploadedFile(slide.imageUrl);
    }

    await slide.deleteOne();
    res.json({ success: true, message: 'Slide supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc  Reorder slides
// @route PUT /api/slider/reorder
exports.reorderSlides = async (req, res) => {
  try {
    const { ordres } = req.body; // [{ id, ordre }, ...]
    if (!Array.isArray(ordres)) {
      return res.status(400).json({ success: false, message: 'Format invalide.' });
    }

    const updates = ordres.map(({ id, ordre }) =>
      Slider.findByIdAndUpdate(id, { ordre }, { new: true })
    );
    await Promise.all(updates);

    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
