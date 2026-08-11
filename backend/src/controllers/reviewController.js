const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create new review
// @route   POST /api/v1/products/:productId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { customerName, customerEmail, rating, comment } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Verify purchase
    // A verified purchase means there's an order for this user (by email or id) containing this product, and it is completed/shipped/delivered.
    const hasPurchased = await Order.findOne({
      $or: [{ 'customer.email': req.user.email }, { customer: userId }],
      'items.product': productId,
      orderStatus: { $in: ['processing', 'packed', 'shipped', 'delivered'] }
    });

    if (!hasPurchased) {
      return res.status(403).json({ success: false, message: 'You can only review products you have purchased.' });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      customerName: req.user.name || customerName,
      customerEmail: req.user.email || customerEmail,
      rating,
      comment,
      isVerifiedPurchase: true,
      status: 'pending', // default is pending
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all approved reviews for a product
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists (optional but good for 404)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ 
      product: productId,
      status: 'approved'
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all highlighted reviews for home page
// @route   GET /api/v1/reviews/highlighted
// @access  Public
exports.getHighlightedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      isHighlighted: true,
      status: 'approved' 
    }).populate('product', 'name slug').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vote on a review (like/dislike)
// @route   POST /api/v1/reviews/:id/vote
// @access  Public
exports.voteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' or 'dislike'

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid vote type' });
    }

    const update = type === 'like' ? { $inc: { likes: 1 } } : { $inc: { dislikes: 1 } };
    
    const review = await Review.findByIdAndUpdate(id, update, { returnDocument: 'after' });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
