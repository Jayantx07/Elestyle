const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(wishlistController.getWishlist)
  .post(wishlistController.addToWishlist);

router.route('/:productId')
  .delete(wishlistController.removeFromWishlist);

module.exports = router;
