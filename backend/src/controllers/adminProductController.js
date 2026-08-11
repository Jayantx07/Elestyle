const Product = require('../models/Product');
const Category = require('../models/Category');
const QueryBuilder = require('../utils/QueryBuilder');
const cloudinaryCleanup = require('../utils/cloudinaryCleanup');
const eventService = require('../services/eventService');
const cacheManager = require('../utils/cacheManager');

exports.getProducts = async (req, res) => {
  try {
    const query = Product.find().populate('category', 'name slug').populate('subCategory', 'name slug');
    const builder = new QueryBuilder(query, req.query)
      .filter([
        { param: 'category', type: 'exact' },
        { param: 'subcategory', field: 'subCategory', type: 'exact' },
        { param: 'status', type: 'exact' },
        { param: 'visibility', type: 'exact' },
        { param: 'featured', type: 'boolean' },
        { param: 'availability', type: 'exact' }
      ])
      .sort('displayOrder -createdAt');

    const results = await builder.paginate();
    
    // Support legacy response schema for unpaginated simple calls while exposing new cursor/offset structures
    const isStandardList = !req.query.page && !req.query.limit && !req.query.after && !req.query.before;
    if (isStandardList && Array.isArray(results.data)) {
      return res.status(200).json({ success: true, data: results.data, total: results.total || results.data.length, ...results });
    }

    res.status(200).json({ success: true, ...results });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug').populate('subCategory', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    // Clear product-related caches
    await cacheManager.clearPattern('facets:public');
    await cacheManager.clearPattern('products:featured');
    
    eventService.dispatchInvalidation('catalog', 'product', product._id);
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ success: false, message: 'Bad request', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.__v;
    delete updatePayload.createdAt;
    delete updatePayload.updatedAt;
    delete updatePayload.slugHistory;
    delete updatePayload.schemaVersion;

    const updatedProduct = await Product.findOneAndUpdate({ _id: req.params.id }, updatePayload, {
      returnDocument: 'after',
      runValidators: true,
    });

    // Cloudinary Cleanup: Purge any orphan images replaced during update
    if (req.body.images && Array.isArray(req.body.images)) {
      await cloudinaryCleanup.cleanupReplacedImages(oldProduct.images, req.body.images);
    }
    
    // Clear relevant caches
    await cacheManager.del(`product:slug:${oldProduct.slug}`);
    if (updatedProduct.slug && updatedProduct.slug !== oldProduct.slug) {
      await cacheManager.del(`product:slug:${updatedProduct.slug}`);
    }
    await cacheManager.clearPattern('facets:public');
    await cacheManager.clearPattern('products:featured');
    
    eventService.dispatchInvalidation('catalog', 'product', updatedProduct._id);

    res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    console.error('Update Product error:', error);
    res.status(400).json({ success: false, message: error.message || 'Bad request', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'inactive',
      visibility: 'hidden',
    }, { returnDocument: 'after' });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If hard delete or archival cleanup is requested via query flag (?permanent=true or ?purge_media=true)
    if (req.query.permanent === 'true' || req.query.purge_media === 'true') {
      await cloudinaryCleanup.cleanupAssets(product.images);
      if (req.query.permanent === 'true') {
        await Product.findByIdAndDelete(req.params.id);
      }
    }

    eventService.dispatchInvalidation('catalog', 'product', req.params.id);

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
