const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateOrderStatus } = require('../controllers/adminOrderController');

router.route('/')
  .get(getOrders);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrderStatus); // Only status update is allowed for orders in admin panel

module.exports = router;
