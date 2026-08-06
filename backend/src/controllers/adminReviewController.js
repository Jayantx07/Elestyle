const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/v1/admin/reviews
// @access  Private/Admin
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name')
      .sort('-createdAt');
    
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review status or highlight
// @route   PUT /api/v1/admin/reviews/:id/status
// @access  Private/Admin
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status, isHighlighted } = req.body; 
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isHighlighted !== undefined) updateData.isHighlighted = isHighlighted;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, message: `Review updated`, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
