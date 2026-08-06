const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getCatalogTree } = require('../controllers/adminCategoryController');

router.route('/tree')
  .get(getCatalogTree);

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
