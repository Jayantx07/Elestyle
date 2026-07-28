const Product = require('../models/Product');
const Category = require('../models/Category'); // Add this!

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products, total: products.length });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
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
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ success: false, message: 'Bad request', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad request', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // Soft delete
    const product = await Product.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
