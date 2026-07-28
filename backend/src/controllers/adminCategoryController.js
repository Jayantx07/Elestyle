const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
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

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad request', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category, message: 'Category updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad request', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category disabled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
