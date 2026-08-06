const express = require('express');
const router = express.Router();
const {
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  reorderSubCategories,
} = require('../controllers/adminSubCategoryController');

router.route('/')
  .get(getSubCategories)
  .post(createSubCategory);

router.route('/reorder')
  .post(reorderSubCategories)
  .put(reorderSubCategories);

router.route('/:id')
  .get(getSubCategoryById)
  .put(updateSubCategory)
  .delete(deleteSubCategory);

module.exports = router;
