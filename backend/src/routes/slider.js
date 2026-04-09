const express = require('express');
const router = express.Router();
const { uploaders } = require('../middleware/upload');
const { getSlides, createSlide, updateSlide, deleteSlide, reorderSlides } = require('../controllers/sliderController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getSlides);

// Admin only
router.post('/', protect, authorize('admin'), uploaders.slider.single('image'), createSlide);
router.put('/reorder', protect, authorize('admin'), reorderSlides);
router.put('/:id', protect, authorize('admin'), uploaders.slider.single('image'), updateSlide);
router.delete('/:id', protect, authorize('admin'), deleteSlide);

module.exports = router;
