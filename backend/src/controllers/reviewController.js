const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/v1/products/:productId/reviews
// @access  Public
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { customerName, customerEmail, rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await Review.create({
      product: productId,
      customerName,
      customerEmail,
      rating,
      comment,
      status: 'pending', // default is pending
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
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
