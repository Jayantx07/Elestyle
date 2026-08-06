const express = require('express');
const router = express.Router();
const { getProductsByCategory } = require('../controllers/productController');
const { getCategories } = require('../controllers/categoryController');
const { getSubCategoriesByCategory } = require('../controllers/subCategoryController');

router.get('/', getCategories);
router.get('/:id/subcategories', getSubCategoriesByCategory);
router.get('/:slug/products', getProductsByCategory);

module.exports = router;
