const express = require('express');
const router = express.Router();
const {
  getPublicProducts,
  getFeaturedProducts,
  getLatestProducts,
  getRelatedProducts,
  getProductBySlug,
} = require('../controllers/productController');

router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/related/:slug', getRelatedProducts);
router.get('/:slug', getProductBySlug);
const reviewRoutes = require('./reviewRoutes');
router.use('/:productId/reviews', reviewRoutes);

router.get('/', getPublicProducts);

module.exports = router;
