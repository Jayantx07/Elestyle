const express = require('express');
const router = express.Router();
const { getHighlightedReviews, voteReview } = require('../controllers/reviewController');

router.get('/highlighted', getHighlightedReviews);
router.post('/:id/vote', voteReview);

module.exports = router;
