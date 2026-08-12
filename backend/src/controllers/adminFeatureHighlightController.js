const mongoose = require('mongoose');
const FeatureHighlight = require('../models/FeatureHighlight');
const Category = require('../models/Category');
const cacheManager = require('../utils/cacheManager');
const mediaService = require('../services/mediaService');
const eventService = require('../services/eventService');
const cloudinary = require('cloudinary').v2;

const ADMIN_CACHE_KEY = 'feature-highlights:admin';

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseDisplayOrder = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const sanitizeHighlight = (highlight) => ({
  _id: highlight._id,
  id: highlight._id,
  altText: highlight.altText || '',
  imageSrc: highlight.imageSrc,
  imagePublicId: highlight.imagePublicId,
  displayOrder: highlight.displayOrder,
  isActive: highlight.isActive,
  category: highlight.category && typeof highlight.category === 'object'
    ? {
        _id: highlight.category._id,
        id: highlight.category._id,
        name: highlight.category.name,
        slug: highlight.category.slug,
      }
    : highlight.category,
  createdAt: highlight.createdAt,
  updatedAt: highlight.updatedAt,
});

const getCategoryOrThrow = async (categoryId) => {
  if (!categoryId || categoryId === 'null' || categoryId === 'undefined') return null;
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return null;
  }
  return await Category.findById(categoryId).select('name slug isActive');
};

const uploadImageAsset = async (file) => {
  if (!file) return null;
  
  // File size validation (5MB max)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('Image file size exceeds the 5MB limit.');
  }

  // File type validation
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file format. Only JPEG, PNG, and WebP are supported.');
  }

  const folderPath = `ElleStyle/FeatureHighlights`;
  const result = await mediaService.uploadImage(file.buffer, folderPath);
  
  // Use Cloudinary transformation for delivery (q_auto, f_auto)
  const optimizedImageUrl = cloudinary.url(result.public_id, {
    transformation: [
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });

  return {
    secure_url: optimizedImageUrl,
    public_id: result.public_id,
  };
};

exports.getAdminFeatureHighlights = async (req, res) => {
  try {
    const highlights = await cacheManager.wrap(ADMIN_CACHE_KEY, 120, async () => {
      const docs = await FeatureHighlight.find()
        .populate('category', 'name slug')
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean();
      return docs.map((h) => sanitizeHighlight(h));
    });
    res.status(200).json({ success: true, data: highlights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createFeatureHighlight = async (req, res) => {
  let uploadedAsset = null;

  try {
    const altText = String(req.body.altText || 'Feature image').trim();
    const categoryId = req.body.category || req.body.categoryId;
    const displayOrder = parseDisplayOrder(req.body.displayOrder);
    const isActive = parseBoolean(req.body.isActive, true);

    if (displayOrder === null) {
      return res.status(400).json({ success: false, message: 'Display order must be a valid non-negative number' });
    }

    const category = await getCategoryOrThrow(categoryId);
    const resolvedCategoryId = category ? category._id : null;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    uploadedAsset = await uploadImageAsset(req.file);

    const highlight = await FeatureHighlight.create({
      altText,
      category: resolvedCategoryId,
      imageSrc: uploadedAsset.secure_url,
      imagePublicId: uploadedAsset.public_id,
      displayOrder,
      isActive,
    });

    await cacheManager.clearPattern('feature-highlights');
    eventService.dispatchInvalidation('catalog', 'featureHighlight', highlight._id);

    const populated = await FeatureHighlight.findById(highlight._id).populate('category', 'name slug');
    res.status(201).json({ success: true, data: sanitizeHighlight(populated), message: 'Feature highlight created successfully' });
  } catch (error) {
    if (uploadedAsset && uploadedAsset.public_id) {
      await mediaService.deleteMedia(uploadedAsset.public_id, 'image').catch(e => console.error(e));
    }
    res.status(400).json({ success: false, message: error.message || 'Failed to create feature highlight', error: error.message });
  }
};

exports.updateFeatureHighlight = async (req, res) => {
  let uploadedAsset = null;

  try {
    const highlight = await FeatureHighlight.findById(req.params.id).populate('category', 'name slug');
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Feature highlight not found' });
    }

    const altText = req.body.altText !== undefined ? String(req.body.altText).trim() : highlight.altText;
    const categoryId = req.body.category !== undefined ? req.body.category : req.body.categoryId;
    const displayOrder = req.body.displayOrder !== undefined ? parseDisplayOrder(req.body.displayOrder) : highlight.displayOrder;
    const isActive = req.body.isActive !== undefined ? parseBoolean(req.body.isActive, highlight.isActive) : highlight.isActive;

    if (displayOrder === null) {
      return res.status(400).json({ success: false, message: 'Display order must be a valid non-negative number' });
    }

    let resolvedCategoryId = highlight.category?._id || null;
    if (categoryId !== undefined) {
      const category = await getCategoryOrThrow(categoryId);
      resolvedCategoryId = category ? category._id : null;
    }

    const oldImagePublicId = highlight.imagePublicId;

    if (req.file) {
      uploadedAsset = await uploadImageAsset(req.file);
      highlight.imageSrc = uploadedAsset.secure_url;
      highlight.imagePublicId = uploadedAsset.public_id;
    }

    highlight.altText = altText;
    highlight.category = resolvedCategoryId;
    highlight.displayOrder = displayOrder;
    highlight.isActive = isActive;

    await highlight.save();

    if (req.file && oldImagePublicId && oldImagePublicId !== highlight.imagePublicId) {
      try {
        await mediaService.deleteMedia(oldImagePublicId, 'image');
      } catch (cleanupErr) {
        console.error(`Failed to delete old image asset [${oldImagePublicId}]:`, cleanupErr.message);
      }
    }

    await cacheManager.clearPattern('feature-highlights');
    eventService.dispatchInvalidation('catalog', 'featureHighlight', highlight._id);

    const populated = await FeatureHighlight.findById(highlight._id).populate('category', 'name slug');
    res.status(200).json({ success: true, data: sanitizeHighlight(populated), message: 'Feature highlight updated successfully' });
  } catch (error) {
    if (uploadedAsset && uploadedAsset.public_id) {
      await mediaService.deleteMedia(uploadedAsset.public_id, 'image').catch(e => console.error(e));
    }
    res.status(400).json({ success: false, message: error.message || 'Failed to update feature highlight', error: error.message });
  }
};

exports.updateFeatureHighlightStatus = async (req, res) => {
  try {
    const highlight = await FeatureHighlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Feature highlight not found' });
    }

    const nextStatus = req.body.isActive !== undefined ? parseBoolean(req.body.isActive, highlight.isActive) : !highlight.isActive;
    highlight.isActive = nextStatus;
    await highlight.save();

    await cacheManager.clearPattern('feature-highlights');
    eventService.dispatchInvalidation('catalog', 'featureHighlight', highlight._id);
    const populated = await FeatureHighlight.findById(highlight._id).populate('category', 'name slug');
    res.status(200).json({ success: true, data: sanitizeHighlight(populated), message: 'Status updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update status', error: error.message });
  }
};

exports.reorderFeatureHighlights = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const updates = items.map((item, index) => {
      if (!item || !item._id) return null;
      return FeatureHighlight.findByIdAndUpdate(item._id, {
        displayOrder: index + 1,
      });
    }).filter(Boolean);

    await Promise.all(updates);
    await cacheManager.clearPattern('feature-highlights');
    eventService.dispatchInvalidation('catalog', 'featureHighlight');

    res.status(200).json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteFeatureHighlight = async (req, res) => {
  try {
    const highlight = await FeatureHighlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Feature highlight not found' });
    }

    await FeatureHighlight.findByIdAndDelete(req.params.id);
    
    try {
      if (highlight.imagePublicId) {
        await mediaService.deleteMedia(highlight.imagePublicId, 'image');
      }
    } catch (cleanupErr) {
      console.error(`Failed to delete Cloudinary image [${highlight.imagePublicId}]:`, cleanupErr.message);
    }

    await cacheManager.clearPattern('feature-highlights');
    eventService.dispatchInvalidation('catalog', 'featureHighlight', req.params.id);

    res.status(200).json({ success: true, message: 'Feature highlight deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
