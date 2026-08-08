const mongoose = require('mongoose');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');
const cacheManager = require('../utils/cacheManager');
const cloudinaryCleanup = require('../utils/cloudinaryCleanup');
const eventService = require('../services/eventService');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Enterprise Hierarchy Tree View API
 * Retreives complete relational mapping: Category -> SubCategory -> Products
 */
exports.getCatalogTree = async (req, res) => {
  try {
    const [categories, subCategories, products] = await Promise.all([
      Category.find({ isDeleted: { $ne: true } }).sort({ displayOrder: 1, name: 1 }).lean(),
      SubCategory.find({ isDeleted: { $ne: true } }).sort({ displayOrder: 1, name: 1 }).lean(),
      Product.find({ isDeleted: { $ne: true } }).select('name slug price discount stock status visibility images displayOrder category subCategory legacySubCategory').sort({ displayOrder: 1, name: 1 }).lean(),
    ]);

    const tree = categories.map((cat) => {
      const catSubs = subCategories
        .filter((sub) => sub.category && sub.category.toString() === cat._id.toString())
        .map((sub) => {
          const subProds = products.filter((p) => {
            const byId = p.subCategory && p.subCategory.toString() === sub._id.toString();
            const byLegacy = p.legacySubCategory === sub.name || p.legacySubCategory === sub.slug || (typeof p.subCategory === 'string' && (p.subCategory === sub.name || p.subCategory === sub.slug));
            return (p.category && p.category.toString() === cat._id.toString()) && (byId || byLegacy);
          });
          return {
            ...sub,
            products: subProds,
            productCount: subProds.length,
          };
        });

      // Find direct products directly attached to Category without a matching subcategory
      const directProds = products.filter((p) => {
        if (!p.category || p.category.toString() !== cat._id.toString()) return false;
        const assignedToAnySub = catSubs.some((sub) => sub.products.some((sp) => sp._id.toString() === p._id.toString()));
        return !assignedToAnySub;
      });

      const totalCatProducts = catSubs.reduce((acc, sub) => acc + sub.productCount, 0) + directProds.length;

      return {
        ...cat,
        subCategories: catSubs,
        directProducts: directProds,
        totalProductCount: totalCatProducts,
      };
    });

    res.status(200).json({ success: true, data: tree });
  } catch (error) {
    console.error('Error constructing catalog tree:', error);
    res.status(500).json({ success: false, message: 'Server error building hierarchy tree', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    await cacheManager.clearPattern('categories');
    eventService.dispatchInvalidation('catalog', 'category', category._id);
    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad request', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const oldCat = await Category.findById(req.params.id);
    if (!oldCat) return res.status(404).json({ success: false, message: 'Category not found' });

    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.__v;
    delete updatePayload.createdAt;
    delete updatePayload.updatedAt;
    delete updatePayload.slugHistory;
    delete updatePayload.schemaVersion;

    const category = await Category.findByIdAndUpdate(req.params.id, updatePayload, { returnDocument: 'after', runValidators: true });
    
    // Cloudinary cleanup for replaced banner or main image
    const oldAssets = [oldCat.image, oldCat.bannerImage, oldCat.icon].filter(Boolean);
    const newAssets = [category.image, category.bannerImage, category.icon].filter(Boolean);
    await cloudinaryCleanup.cleanupReplacedImages(oldAssets, newAssets);

    await cacheManager.clearPattern('categories');
    eventService.dispatchInvalidation('catalog', 'category', category._id);
    res.status(200).json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update Category error:', error);
    res.status(400).json({ success: false, message: error.message || 'Bad request', error: error.message });
  }
};

/**
 * Transactional Category Deletion with Soft Delete Protection
 * Encloses deletion inside an atomic MongoDB session transaction.
 */
exports.deleteCategory = async (req, res) => {
  let session;
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category because it has ${productCount} active assigned product(s). Please migrate products or deactivate the category.` 
      });
    }

    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (sErr) {
      console.warn('[MongoDB Session] Running without ReplicaSet session support:', sErr.message);
      session = null;
    }

    const options = session ? { session } : {};

    // Soft delete category and child subcategories atomically
    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      { isDeleted: true, deletedAt: new Date(), isActive: false }, 
      { returnDocument: 'after', ...options }
    );
    
    if (!category) {
      if (session) { await session.abortTransaction(); session.endSession(); }
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Simultaneously soft-delete associated subcategories inside transaction
    await SubCategory.updateMany(
      { category: req.params.id }, 
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      options
    );

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    if (req.query.permanent === 'true') {
      await cloudinaryCleanup.cleanupAssets([category.image, category.bannerImage, category.icon].filter(Boolean));
      await Category.findByIdAndDelete(req.params.id);
    }

    await cacheManager.clearPattern('categories');
    await cacheManager.clearPattern('subcategories');
    eventService.dispatchInvalidation('catalog', 'category', req.params.id);
    // Subcategories were also deleted atomically, notify clients
    eventService.dispatchInvalidation('catalog', 'subcategory');

    res.status(200).json({ success: true, message: 'Category and child subcategories deleted safely via transaction' });
  } catch (error) {
    if (session) {
      try { await session.abortTransaction(); session.endSession(); } catch (e) {}
    }
    res.status(500).json({ success: false, message: 'Server error during transactional deletion', error: error.message });
  }
};
