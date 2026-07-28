const multer = require('multer');

// Configure Multer to use memory storage since we will stream the buffer to Cloudinary
const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
  // Accepted MIME types
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

// Configure limits and export the middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max file size per image
  },
});

module.exports = upload;
