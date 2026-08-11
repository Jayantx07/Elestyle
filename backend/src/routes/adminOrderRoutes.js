const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateOrderStatus, cancelOrder, refundOrder } = require('../controllers/adminOrderController');

router.route('/')
  .get(getOrders);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrderStatus);

router.post('/:id/cancel', cancelOrder);
router.post('/:id/refund', refundOrder);

module.exports = router;
