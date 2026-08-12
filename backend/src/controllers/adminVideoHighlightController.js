const mongoose = require('mongoose');
const VideoHighlight = require('../models/VideoHighlight');
const Category = require('../models/Category');
const cacheManager = require('../utils/cacheManager');
const cloudinaryCleanup = require('../utils/cloudinaryCleanup');
const mediaService = require('../services/mediaService');
const eventService = require('../services/eventService');
const cloudinary = require('cloudinary').v2;

const PUBLIC_CACHE_KEY = 'video-highlights:public';
const ADMIN_CACHE_KEY = 'video-highlights:admin';

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
  title: highlight.title || '',
  videoUrl: highlight.videoUrl,
  videoPublicId: highlight.videoPublicId,
  posterUrl: highlight.posterUrl,
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

const uploadVideoAsset = async (file) => {
  if (!file) return null;
  // File size validation (10MB max)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('Video file size exceeds the 10MB limit.');
  }

  // File type validation
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file format. Only MP4, WebM, and MOV are supported.');
  }

  const folderPath = `ElleStyle/VideoHighlights`;
  const result = await mediaService.uploadVideo(file.buffer, folderPath);
  
  // Validate duration from Cloudinary result
  if (result.duration && result.duration > 31) { // 31 to allow slight float rounding
    // Rollback the upload immediately
    await mediaService.deleteMedia(result.public_id, 'video');
    throw new Error('Video duration exceeds the 30-second limit.');
  }

  // Generate poster URL explicitly via Cloudinary transform
  // Cloudinary allows changing extension to .jpg for video thumbnails
  // We can also apply transformations like f_auto, q_auto
  const posterUrl = cloudinary.url(result.public_id, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });

  const optimizedVideoUrl = cloudinary.url(result.public_id, {
    resource_type: 'video',
    transformation: [
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });

  return {
    secure_url: optimizedVideoUrl,
    public_id: result.public_id,
    poster_url: posterUrl
  };
};

exports.getAdminVideoHighlights = async (req, res) => {
  try {
    const highlights = await cacheManager.wrap(ADMIN_CACHE_KEY, 120, async () => {
      const docs = await VideoHighlight.find()
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

exports.createVideoHighlight = async (req, res) => {
  let uploadedAsset = null;

  try {
    const title = String(req.body.title || '').trim();
    const categoryId = req.body.category || req.body.categoryId;
    const displayOrder = parseDisplayOrder(req.body.displayOrder);
    const isActive = parseBoolean(req.body.isActive, true);

    if (displayOrder === null) {
      return res.status(400).json({ success: false, message: 'Display order must be a valid non-negative number' });
    }

    const category = await getCategoryOrThrow(categoryId);
    const resolvedCategoryId = category ? category._id : null;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    uploadedAsset = await uploadVideoAsset(req.file);

    const highlight = await VideoHighlight.create({
      title,
      category: resolvedCategoryId,
      videoUrl: uploadedAsset.secure_url,
      videoPublicId: uploadedAsset.public_id,
      posterUrl: uploadedAsset.poster_url,
      displayOrder,
      isActive,
    });

    await cacheManager.clearPattern('video-highlights');
    eventService.dispatchInvalidation('catalog', 'videoHighlight', highlight._id);

    const populated = await VideoHighlight.findById(highlight._id).populate('category', 'name slug');
    res.status(201).json({ success: true, data: sanitizeHighlight(populated), message: 'Video highlight created successfully' });
  } catch (error) {
    // If validation threw error before DB create, but upload happened, cleanup happens in uploadVideoAsset if duration failed.
    // If other errors happen after upload but before DB create:
    if (uploadedAsset && uploadedAsset.public_id && error.message !== 'Video duration exceeds the 30-second limit.') {
      await mediaService.deleteMedia(uploadedAsset.public_id, 'video').catch(e => console.error(e));
    }
    res.status(400).json({ success: false, message: error.message || 'Failed to create video highlight', error: error.message });
  }
};

exports.updateVideoHighlight = async (req, res) => {
  let uploadedAsset = null;

  try {
    const highlight = await VideoHighlight.findById(req.params.id).populate('category', 'name slug');
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Video highlight not found' });
    }

    const title = req.body.title !== undefined ? String(req.body.title).trim() : highlight.title;
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

    const oldVideoPublicId = highlight.videoPublicId;

    if (req.file) {
      uploadedAsset = await uploadVideoAsset(req.file);
      highlight.videoUrl = uploadedAsset.secure_url;
      highlight.videoPublicId = uploadedAsset.public_id;
      highlight.posterUrl = uploadedAsset.poster_url;
    }

    highlight.title = title;
    highlight.category = resolvedCategoryId;
    highlight.displayOrder = displayOrder;
    highlight.isActive = isActive;

    await highlight.save();

    // Transactional logic: successfully saved new video to DB, now delete old asset
    if (req.file && oldVideoPublicId && oldVideoPublicId !== highlight.videoPublicId) {
      try {
        await mediaService.deleteMedia(oldVideoPublicId, 'video');
      } catch (cleanupErr) {
        console.error(`Failed to delete old video asset [${oldVideoPublicId}]:`, cleanupErr.message);
      }
    }

    await cacheManager.clearPattern('video-highlights');
    eventService.dispatchInvalidation('catalog', 'videoHighlight', highlight._id);

    const populated = await VideoHighlight.findById(highlight._id).populate('category', 'name slug');
    res.status(200).json({ success: true, data: sanitizeHighlight(populated), message: 'Video highlight updated successfully' });
  } catch (error) {
    if (uploadedAsset && uploadedAsset.public_id && error.message !== 'Video duration exceeds the 30-second limit.') {
      await mediaService.deleteMedia(uploadedAsset.public_id, 'video').catch(e => console.error(e));
    }
    res.status(400).json({ success: false, message: error.message || 'Failed to update video highlight', error: error.message });
  }
};

exports.updateVideoHighlightStatus = async (req, res) => {
  try {
    const highlight = await VideoHighlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Video highlight not found' });
    }

    const nextStatus = req.body.isActive !== undefined ? parseBoolean(req.body.isActive, highlight.isActive) : !highlight.isActive;
    highlight.isActive = nextStatus;
    await highlight.save();

    await cacheManager.clearPattern('video-highlights');
    eventService.dispatchInvalidation('catalog', 'videoHighlight', highlight._id);
    const populated = await VideoHighlight.findById(highlight._id).populate('category', 'name slug');
    res.status(200).json({ success: true, data: sanitizeHighlight(populated), message: 'Status updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update status', error: error.message });
  }
};

exports.reorderVideoHighlights = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    // Normalize display order sequentially
    const updates = items.map((item, index) => {
      if (!item || !item._id) return null;
      return VideoHighlight.findByIdAndUpdate(item._id, {
        displayOrder: index + 1,
      });
    }).filter(Boolean);

    await Promise.all(updates);
    await cacheManager.clearPattern('video-highlights');
    eventService.dispatchInvalidation('catalog', 'videoHighlight');

    res.status(200).json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteVideoHighlight = async (req, res) => {
  try {
    const highlight = await VideoHighlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Video highlight not found' });
    }

    // Explicit delete flow: delete DB record first, then delete Cloudinary asset
    await VideoHighlight.findByIdAndDelete(req.params.id);
    
    try {
      if (highlight.videoPublicId) {
        await mediaService.deleteMedia(highlight.videoPublicId, 'video');
      }
    } catch (cleanupErr) {
      console.error(`Failed to delete Cloudinary video [${highlight.videoPublicId}]:`, cleanupErr.message);
      // Log it but don't break the response
    }

    await cacheManager.clearPattern('video-highlights');
    eventService.dispatchInvalidation('catalog', 'videoHighlight', req.params.id);

    res.status(200).json({ success: true, message: 'Video highlight deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
