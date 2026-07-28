const express = require('express');
const router = express.Router();
const { getProductsByCategory } = require('../controllers/productController');
const { getCategories } = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:slug/products', getProductsByCategory);

module.exports = router;
