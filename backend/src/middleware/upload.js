const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload dirs exist
const UPLOAD_DIRS = {
  produits:    path.join(__dirname, '../../uploads/produits'),
  slider:      path.join(__dirname, '../../uploads/slider'),
  accessoires: path.join(__dirname, '../../uploads/accessoires'),
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

/**
 * Create a multer uploader for a given category
 * @param {'produits'|'slider'|'accessoires'} category
 */
function createUploader(category) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIRS[category]);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const name = `${category}-${uuidv4()}${ext}`;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé. Formats acceptés: JPG, PNG, WebP, GIF`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  });
}

/**
 * Delete an uploaded file by its URL path
 * @param {string} fileUrl - e.g. "/uploads/produits/produits-uuid.jpg"
 */
function deleteUploadedFile(fileUrl) {
  if (!fileUrl) return;
  try {
    // Extract relative path from URL
    const relativePath = fileUrl.replace(/^\//, '');
    const fullPath = path.join(__dirname, '../../', relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Erreur suppression fichier:', err.message);
  }
}

const uploaders = {
  produits:    createUploader('produits'),
  slider:      createUploader('slider'),
  accessoires: createUploader('accessoires'),
};

module.exports = { uploaders, deleteUploadedFile, UPLOAD_DIRS };
