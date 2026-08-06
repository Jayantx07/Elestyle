const express = require('express');
const router = express.Router();
const {
  getFilters,
  getFilterById,
  createFilter,
  updateFilter,
  deleteFilter,
  reorderFilters,
} = require('../controllers/adminFilterController');

router.route('/')
  .get(getFilters)
  .post(createFilter);

router.route('/reorder')
  .post(reorderFilters)
  .put(reorderFilters);

router.route('/:id')
  .get(getFilterById)
  .put(updateFilter)
  .delete(deleteFilter);

module.exports = router;
