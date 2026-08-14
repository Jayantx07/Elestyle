const mongoose = require('mongoose');
const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');
const Category = require('../models/Category');
const cacheManager = require('../utils/cacheManager');
const cloudinaryCleanup = require('../utils/cloudinaryCleanup');
const eventService = require('../services/eventService');

exports.getSubCategories = async (req, res) => {
  try {
    const { category, search, active, page, limit } = req.query;
    const query = {};

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ $or: [{ slug: category }, { name: category }] });
        if (cat) query.category = cat._id;
        else return res.status(200).json({ success: true, data: [], total: 0 });
      }
    }

    if (active !== undefined && active !== '') {
      query.isActive = active === 'true';
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { description: regex }, { slug: regex }];
    }

    let subCategoriesQuery = SubCategory.find(query).populate('category', 'name slug').sort({ displayOrder: 1, name: 1 });
    let total = await SubCategory.countDocuments(query);

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      subCategoriesQuery = subCategoriesQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const subCategories = await subCategoriesQuery;

    // Attach dynamic product counts via aggregation
    const subCatIds = subCategories.map((sc) => sc._id);
    const subCatNames = subCategories.map((sc) => sc.name);
    const counts = await Product.aggregate([
      {
        $match: {
          $or: [
            { subCategory: { $in: subCatIds } },
            { legacySubCategory: { $in: subCatNames } },
          ],
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: {
            id: '$subCategory',
            legacy: '$legacySubCategory',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dataWithCounts = subCategories.map((sc) => {
      const doc = sc.toObject();
      const matchCount = counts.reduce((sum, item) => {
        const matchId = item._id && item._id.id && item._id.id.toString() === sc._id.toString();
        const matchLegacy = item._id && (item._id.legacy === sc.name || (typeof item._id.id === 'string' && item._id.id === sc.name));
        return sum + (matchId || matchLegacy ? item.count : 0);
      }, 0);
      doc.productCount = matchCount;
      return doc;
    });

    res.status(200).json({ success: true, data: dataWithCounts, total });
  } catch (error) {
    console.error('getSubCategories error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate('category', 'name slug');
    if (!subCategory) return res.status(404).json({ success: false, message: 'SubCategory not found' });
    res.status(200).json({ success: true, data: subCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createSubCategory = async (req, res) => {
  try {
    const { category, name } = req.body;
    const catDoc = await Category.findById(category);
    if (!catDoc) {
      return res.status(400).json({ success: false, message: 'Parent Category does not exist' });
    }

    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const existing = await SubCategory.findOne({ category, name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'SubCategory with this name already exists in this category' });
    }

    // Ensure global slug uniqueness
    const slugify = require('slugify');
    let finalSlug = req.body.slug || slugify(name, { lower: true, strict: true });
    let slugExists = await SubCategory.collection.findOne({ slug: finalSlug });
    let counter = 1;
    let baseSlug = finalSlug;
    while (slugExists) {
      finalSlug = `${baseSlug}-${counter}`;
      slugExists = await SubCategory.collection.findOne({ slug: finalSlug });
      counter++;
    }
    req.body.slug = finalSlug;

    const subCategory = await SubCategory.create(req.body);
    await cacheManager.clearPattern('subcategories');
    await cacheManager.clearPattern('categories');
    eventService.dispatchInvalidation('catalog', 'subcategory', subCategory._id);

    res.status(201).json({ success: true, data: subCategory, message: 'SubCategory created successfully' });
  } catch (error) {
    console.error('CREATE SUBCAT ERROR:', error);
    require('fs').appendFileSync('error_log.txt', new Date().toISOString() + ' CREATE SUBCAT ERROR: ' + (error.stack || error) + '\n');
    res.status(400).json({ success: false, message: error.message || 'SERVER_CATCH_FALLBACK', error: error.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const oldSub = await SubCategory.findById(req.params.id);
    if (!oldSub) return res.status(404).json({ success: false, message: 'SubCategory not found' });

    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.__v;
    delete updatePayload.createdAt;
    delete updatePayload.updatedAt;
    delete updatePayload.slugHistory;
    delete updatePayload.schemaVersion;

    // Ensure global slug uniqueness if it's changing
    if (updatePayload.slug) {
      let finalSlug = updatePayload.slug;
      let slugExists = await SubCategory.collection.findOne({ slug: finalSlug, _id: { $ne: new mongoose.Types.ObjectId(req.params.id) } });
      let counter = 1;
      let baseSlug = finalSlug;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await SubCategory.collection.findOne({ slug: finalSlug, _id: { $ne: new mongoose.Types.ObjectId(req.params.id) } });
        counter++;
      }
      updatePayload.slug = finalSlug;
    }

    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, updatePayload, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('category', 'name slug');

    // Cloudinary cleanup for replaced banner, icon, or image
    const oldAssets = [oldSub.image, oldSub.bannerImage, oldSub.icon].filter(Boolean);
    const newAssets = [subCategory.image, subCategory.bannerImage, subCategory.icon].filter(Boolean);
    await cloudinaryCleanup.cleanupReplacedImages(oldAssets, newAssets);

    await cacheManager.clearPattern('subcategories');
    await cacheManager.clearPattern('categories');
    eventService.dispatchInvalidation('catalog', 'subcategory', subCategory._id);

    res.status(200).json({ success: true, data: subCategory, message: 'SubCategory updated successfully' });
  } catch (error) {
    console.error('Update SubCategory error:', error);
    require('fs').appendFileSync('error_log.txt', new Date().toISOString() + ' UPDATE SUBCAT ERROR: ' + (error.stack || error) + '\n');
    res.status(400).json({ success: false, message: error.message || 'SERVER_CATCH_FALLBACK2', error: error.message });
  }
};

/**
 * Transaction-protected safe deletion of SubCategories with orphan cleanup
 */
exports.deleteSubCategory = async (req, res) => {
  let session;
  try {
    const subCat = await SubCategory.findById(req.params.id);
    if (!subCat) return res.status(404).json({ success: false, message: 'SubCategory not found' });

    const productCount = await Product.countDocuments({
      $or: [
        { subCategory: subCat._id },
        { legacySubCategory: subCat.name },
      ],
      isDeleted: { $ne: true },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete SubCategory "${subCat.name}" because ${productCount} assigned product(s) exist. Please mark as inactive or archive instead to prevent orphan products.`,
        dependencyCount: productCount,
      });
    }

    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (sErr) {
      session = null;
    }

    const options = session ? { session } : {};

    await SubCategory.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
      isActive: false,
    }, options);

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    if (req.query.permanent === 'true') {
      await cloudinaryCleanup.cleanupAssets([subCat.image, subCat.bannerImage, subCat.icon].filter(Boolean));
      await SubCategory.findByIdAndDelete(req.params.id);
    }

    await cacheManager.clearPattern('subcategories');
    await cacheManager.clearPattern('categories');
    eventService.dispatchInvalidation('catalog', 'subcategory', req.params.id);

    res.status(200).json({ success: true, message: 'SubCategory deleted safely via transaction' });
  } catch (error) {
    if (session) {
      try { await session.abortTransaction(); session.endSession(); } catch (e) {}
    }
    res.status(500).json({ success: false, message: 'Server error during transactional deletion', error: error.message });
  }
};

exports.reorderSubCategories = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const updatePromises = items.map((item, index) =>
      SubCategory.findByIdAndUpdate(item._id, { displayOrder: item.displayOrder !== undefined ? item.displayOrder : index })
    );

    await Promise.all(updatePromises);
    await cacheManager.clearPattern('subcategories');
    await cacheManager.clearPattern('categories');
    eventService.dispatchInvalidation('catalog', 'subcategory'); // Bulk update

    res.status(200).json({ success: true, message: 'Display order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
