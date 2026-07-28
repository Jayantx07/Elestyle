const express = require('express');
const router = express.Router();
const { getReviews, updateReviewStatus, deleteReview } = require('../controllers/adminReviewController');

router.route('/')
  .get(getReviews);

router.route('/:id/status')
  .put(updateReviewStatus);

router.route('/:id')
  .delete(deleteReview);

module.exports = router;
