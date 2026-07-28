const express = require('express');
const router = express.Router();
const { getProductsByCategory } = require('../controllers/productController');

router.get('/:slug/products', getProductsByCategory);

module.exports = router;
