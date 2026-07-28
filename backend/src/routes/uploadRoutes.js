const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const mediaService = require('../services/mediaService');

// POST /api/upload
// Expects multipart/form-data with 'images' field (up to 10 files)
// Also requires 'category' and 'productSlug' in req.body for folder organization
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { category, productSlug } = req.body;
    
    if (!category || !productSlug) {
      return res.status(400).json({ message: 'Category and productSlug are required to organize images.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided.' });
    }

    const folderPath = mediaService.buildFolderPath(category, productSlug);
    const uploadPromises = req.files.map(file => mediaService.uploadImage(file.buffer, folderPath));

    const results = await Promise.all(uploadPromises);

    // Map Cloudinary results to our expected metadata format
    const metadata = results.map(result => ({
      public_id: result.public_id,
      secure_url: result.secure_url,
      original_filename: result.original_filename,
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      format: result.format,
    }));

    res.status(200).json({
      message: 'Images uploaded successfully',
      data: metadata,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload images', error: error.message });
  }
});

// DELETE /api/upload
// Expects { public_id: '...' } in req.body
router.delete('/', async (req, res) => {
  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ message: 'public_id is required for deletion.' });
    }

    const result = await mediaService.deleteImage(public_id);

    if (result.result === 'ok') {
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete image', result });
    }
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

module.exports = router;
