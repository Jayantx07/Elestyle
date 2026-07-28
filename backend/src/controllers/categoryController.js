const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.navbar === 'true') filter.showInNavbar = true;
    if (req.query.homepage === 'true') filter.showInHomepage = true;
    if (req.query.carousel === 'true') filter.showInCircularCarousel = true;
    if (req.query.search === 'true') filter.showInSearch = true;

    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
