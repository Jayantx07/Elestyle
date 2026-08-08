const mongoose = require('mongoose');
const LandingBanner = require('../models/LandingBanner');
const Category = require('../models/Category');
const cacheManager = require('../utils/cacheManager');
const cloudinaryCleanup = require('../utils/cloudinaryCleanup');
const mediaService = require('../services/mediaService');
const eventService = require('../services/eventService');

const PUBLIC_CACHE_KEY = 'landing-banners:public';
const ADMIN_CACHE_KEY = 'landing-banners:admin';

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseDisplayOrder = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const sanitizeBanner = (banner) => ({
  _id: banner._id,
  id: banner._id,
  title: banner.title,
  subtitle: banner.subtitle || '',
  imageUrl: banner.imageUrl,
  imagePublicId: banner.imagePublicId,
  displayOrder: banner.displayOrder,
  isActive: banner.isActive,
  category: banner.category && typeof banner.category === 'object'
    ? {
        _id: banner.category._id,
        id: banner.category._id,
        name: banner.category.name,
        slug: banner.category.slug,
      }
    : banner.category,
  createdAt: banner.createdAt,
  updatedAt: banner.updatedAt,
});

const getCategoryOrThrow = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return null;
  }

  const category = await Category.findById(categoryId).select('name slug isActive');
  return category;
};

const uploadBannerImage = async (file, categorySlug) => {
  if (!file) return null;
  return await mediaService.uploadImage(file.buffer, `ElleStyle/LandingBanners/${categorySlug}`);
};

exports.getPublicLandingBanners = async (req, res) => {
  try {
    const banners = await cacheManager.wrap(PUBLIC_CACHE_KEY, 300, async () => {
      const docs = await LandingBanner.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean();

      return docs.map((banner) => ({
        id: banner._id,
        title: banner.title,
        subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl,
        displayOrder: banner.displayOrder,
        category: banner.category
          ? {
              id: banner.category._id,
              name: banner.category.name,
              slug: banner.category.slug,
            }
          : null,
      }));
    });

    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAdminLandingBanners = async (req, res) => {
  try {
    const banners = await cacheManager.wrap(ADMIN_CACHE_KEY, 120, async () => {
      const docs = await LandingBanner.find()
        .populate('category', 'name slug')
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean();

      return docs.map((banner) => sanitizeBanner(banner));
    });

    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getLandingBannerById = async (req, res) => {
  try {
    const banner = await LandingBanner.findById(req.params.id).populate('category', 'name slug');
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({ success: true, data: sanitizeBanner(banner) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createLandingBanner = async (req, res) => {
  let uploadedImage = null;

  try {
    const title = String(req.body.title || '').trim();
    const subtitle = String(req.body.subtitle || '').trim();
    const categoryId = String(req.body.category || req.body.categoryId || '').trim();
    const displayOrder = parseDisplayOrder(req.body.displayOrder);
    const isActive = parseBoolean(req.body.isActive, true);

    if (!title) {
      return res.status(400).json({ success: false, message: 'Banner title is required' });
    }

    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Banner category is required' });
    }

    if (displayOrder === null) {
      return res.status(400).json({ success: false, message: 'Display order must be a valid non-negative number' });
    }

    const category = await getCategoryOrThrow(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category selected' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Banner image is required' });
    }

    uploadedImage = await uploadBannerImage(req.file, category.slug);

    const banner = await LandingBanner.create({
      title,
      subtitle,
      category: category._id,
      imageUrl: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
      displayOrder,
      isActive,
    });

    await cacheManager.clearPattern('landing-banners');
    eventService.dispatchInvalidation('catalog', 'landingBanner', banner._id);

    const populatedBanner = await LandingBanner.findById(banner._id).populate('category', 'name slug');
    res.status(201).json({ success: true, data: sanitizeBanner(populatedBanner), message: 'Banner created successfully' });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await cloudinaryCleanup.cleanupAssets(uploadedImage.public_id);
    }
    res.status(400).json({ success: false, message: error.message || 'Failed to create banner', error: error.message });
  }
};

exports.updateLandingBanner = async (req, res) => {
  let uploadedImage = null;

  try {
    const banner = await LandingBanner.findById(req.params.id).populate('category', 'name slug');
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const title = String(req.body.title ?? banner.title).trim();
    const subtitle = req.body.subtitle !== undefined ? String(req.body.subtitle).trim() : banner.subtitle;
    const categoryId = String(req.body.category ?? req.body.categoryId ?? banner.category?._id ?? '').trim();
    const displayOrder = req.body.displayOrder !== undefined ? parseDisplayOrder(req.body.displayOrder) : banner.displayOrder;
    const isActive = req.body.isActive !== undefined ? parseBoolean(req.body.isActive, banner.isActive) : banner.isActive;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Banner title is required' });
    }

    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Banner category is required' });
    }

    if (displayOrder === null) {
      return res.status(400).json({ success: false, message: 'Display order must be a valid non-negative number' });
    }

    const category = await getCategoryOrThrow(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category selected' });
    }

    const oldImagePublicId = banner.imagePublicId;

    if (req.file) {
      uploadedImage = await uploadBannerImage(req.file, category.slug);
      banner.imageUrl = uploadedImage.secure_url;
      banner.imagePublicId = uploadedImage.public_id;
    }

    banner.title = title;
    banner.subtitle = subtitle || '';
    banner.category = category._id;
    banner.displayOrder = displayOrder;
    banner.isActive = isActive;

    await banner.save();

    if (req.file && oldImagePublicId && oldImagePublicId !== banner.imagePublicId) {
      await cloudinaryCleanup.cleanupAssets(oldImagePublicId);
    }

    await cacheManager.clearPattern('landing-banners');
    eventService.dispatchInvalidation('catalog', 'landingBanner', banner._id);

    const populatedBanner = await LandingBanner.findById(banner._id).populate('category', 'name slug');
    res.status(200).json({ success: true, data: sanitizeBanner(populatedBanner), message: 'Banner updated successfully' });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await cloudinaryCleanup.cleanupAssets(uploadedImage.public_id);
    }
    res.status(400).json({ success: false, message: error.message || 'Failed to update banner', error: error.message });
  }
};

exports.updateLandingBannerStatus = async (req, res) => {
  try {
    const banner = await LandingBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const nextStatus = req.body.isActive !== undefined ? parseBoolean(req.body.isActive, banner.isActive) : !banner.isActive;
    banner.isActive = nextStatus;
    await banner.save();

    await cacheManager.clearPattern('landing-banners');
    eventService.dispatchInvalidation('catalog', 'landingBanner', banner._id);
    const populatedBanner = await LandingBanner.findById(banner._id).populate('category', 'name slug');
    res.status(200).json({ success: true, data: sanitizeBanner(populatedBanner), message: 'Banner status updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update banner status', error: error.message });
  }
};

exports.reorderLandingBanners = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const updates = items.map((item, index) => {
      if (!item || !item._id) {
        return null;
      }

      return LandingBanner.findByIdAndUpdate(item._id, {
        displayOrder: parseDisplayOrder(item.displayOrder) ?? index + 1,
      });
    }).filter(Boolean);

    await Promise.all(updates);
    await cacheManager.clearPattern('landing-banners');
    eventService.dispatchInvalidation('catalog', 'landingBanner');

    res.status(200).json({ success: true, message: 'Banner order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteLandingBanner = async (req, res) => {
  try {
    const banner = await LandingBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await LandingBanner.findByIdAndDelete(req.params.id);
    await cloudinaryCleanup.cleanupAssets(banner.imagePublicId);
    await cacheManager.clearPattern('landing-banners');
    eventService.dispatchInvalidation('catalog', 'landingBanner', req.params.id);

    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};