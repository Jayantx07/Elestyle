const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :productId
const { createReview, getProductReviews, getHighlightedReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Routes related to a specific product
// Example: /api/v1/products/:productId/reviews
router.route('/')
  .post(protect, createReview)
  .get(getProductReviews);

// Highlighted reviews route needs to be mounted separately or handled specially if mergeParams conflicts
// We'll expose a separate route file for standalone review routes like /highlighted
// See below

module.exports = router;
