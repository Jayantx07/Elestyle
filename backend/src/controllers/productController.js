const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getPublicProducts = async (req, res) => {
  try {
    const { category, tag, featured, search, page = 1, limit = 12, sort } = req.query;

    const query = { visibility: 'public' };

    // Filter by Category
    if (category) {
      // Find category by slug
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(200).json({ success: true, data: [], total: 0, message: 'Category not found' });
      }
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }

    // Search query
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { searchKeywords: { $in: [searchRegex] } },
      ];
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort) {
      if (sort === 'price-low') sortObj = { price: 1 };
      else if (sort === 'price-high') sortObj = { price: -1 };
      else if (sort === 'rating') sortObj = { ratingAverage: -1 };
      else if (sort === 'latest') sortObj = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({ success: true, data: products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, visibility: 'public' }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true, visibility: 'public' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find({ visibility: 'public' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      visibility: 'public',
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({ success: true, data: relatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryDoc = await Category.findOne({ slug: req.params.slug });
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { page = 1, limit = 12, sort } = req.query;
    
    let sortObj = { createdAt: -1 };
    if (sort) {
      if (sort === 'price-low') sortObj = { price: 1 };
      else if (sort === 'price-high') sortObj = { price: -1 };
      else if (sort === 'rating') sortObj = { ratingAverage: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = { category: categoryDoc._id, visibility: 'public' };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({ success: true, data: products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
