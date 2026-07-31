const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All cart routes require authentication

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.post('/merge', mergeCart);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
