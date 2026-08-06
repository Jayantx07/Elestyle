const mongoose = require('mongoose');
const Category = require('../models/Category');
const FilterConfiguration = require('../models/FilterConfiguration');
const cacheManager = require('../utils/cacheManager');

const DEFAULT_FILTERS = [
  { name: 'SubCategory', key: 'subcategory', type: 'Checkbox', displayOrder: 1, defaultExpanded: true, showProductCounts: true },
  { name: 'Color', key: 'color', type: 'Color Swatch', displayOrder: 2, defaultExpanded: true, showProductCounts: true },
  { name: 'Price Range', key: 'price', type: 'Price Range', displayOrder: 3, defaultExpanded: true, showProductCounts: false },
  { name: 'Material', key: 'material', type: 'Checkbox', displayOrder: 4, defaultExpanded: false, showProductCounts: true },
  { name: 'Availability', key: 'availability', type: 'Checkbox', displayOrder: 5, defaultExpanded: false, showProductCounts: true },
  { name: 'Discount', key: 'discount', type: 'Checkbox', displayOrder: 6, defaultExpanded: false, showProductCounts: true },
  { name: 'Rating', key: 'rating', type: 'Rating', displayOrder: 7, defaultExpanded: false, showProductCounts: true },
];

exports.getFilters = async (req, res) => {
  try {
    const { category } = req.query;
    const cacheKey = `filters:public:${category || 'global'}`;

    const filters = await cacheManager.wrap(cacheKey, 600, async () => {
      const query = {};
      if (category && category !== 'undefined' && category !== 'null') {
        let categoryId = null;
        if (mongoose.Types.ObjectId.isValid(category)) {
          categoryId = category;
        } else {
          const foundCat = await Category.findOne({
            $or: [
              { slug: category },
              { name: { $regex: new RegExp(`^${category}$`, 'i') } }
            ]
          });
          if (foundCat) categoryId = foundCat._id;
        }

        if (categoryId) {
          query.$or = [{ category: null }, { category: categoryId }];
        } else {
          query.category = null; // Default to global filters
        }
      } else {
        query.category = null;
      }

      let resFilters = await FilterConfiguration.find(query).sort({ displayOrder: 1 });

      if (resFilters.length === 0 && (!query.$or || query.category === null)) {
        await FilterConfiguration.insertMany(DEFAULT_FILTERS);
        resFilters = await FilterConfiguration.find(query).sort({ displayOrder: 1 });
      }
      return resFilters;
    });

    res.status(200).json({ success: true, data: filters });
  } catch (error) {
    console.error('getFilters error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.getFilterById = async (req, res) => {
  try {
    const filter = await FilterConfiguration.findById(req.params.id);
    if (!filter) return res.status(404).json({ success: false, message: 'Filter configuration not found' });
    res.status(200).json({ success: true, data: filter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createFilter = async (req, res) => {
  try {
    const filter = await FilterConfiguration.create(req.body);
    await cacheManager.clearPattern('filters');
    res.status(201).json({ success: true, data: filter, message: 'Filter configuration created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Bad request', error: error.message });
  }
};

exports.updateFilter = async (req, res) => {
  try {
    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.__v;
    delete updatePayload.createdAt;
    delete updatePayload.updatedAt;

    const filter = await FilterConfiguration.findByIdAndUpdate(req.params.id, updatePayload, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!filter) return res.status(404).json({ success: false, message: 'Filter configuration not found' });
    
    await cacheManager.clearPattern('filters');
    res.status(200).json({ success: true, data: filter, message: 'Filter updated successfully' });
  } catch (error) {
    console.error('Update Filter error:', error);
    res.status(400).json({ success: false, message: error.message || 'Bad request', error: error.message });
  }
};

exports.deleteFilter = async (req, res) => {
  try {
    const filter = await FilterConfiguration.findByIdAndDelete(req.params.id);
    if (!filter) return res.status(404).json({ success: false, message: 'Filter configuration not found' });
    
    await cacheManager.clearPattern('filters');
    res.status(200).json({ success: true, message: 'Filter deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.reorderFilters = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const updatePromises = items.map((item, index) =>
      FilterConfiguration.findByIdAndUpdate(item._id, { displayOrder: item.displayOrder !== undefined ? item.displayOrder : index })
    );

    await Promise.all(updatePromises);
    await cacheManager.clearPattern('filters');

    res.status(200).json({ success: true, message: 'Filter display order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

