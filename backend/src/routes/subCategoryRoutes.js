const express = require('express');
const router = express.Router();
const {
  getPublicSubCategories,
  getSubCategoryBySlug,
} = require('../controllers/subCategoryController');

router.get('/', getPublicSubCategories);
router.get('/:slug', getSubCategoryBySlug);

module.exports = router;
