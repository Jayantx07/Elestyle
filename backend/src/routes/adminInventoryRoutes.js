const express = require('express');
const router = express.Router();
const { getInventory, updateStock } = require('../controllers/adminInventoryController');

router.route('/')
  .get(getInventory);

router.route('/:id/stock')
  .put(updateStock);

module.exports = router;
