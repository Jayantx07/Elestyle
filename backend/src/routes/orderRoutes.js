const express = require('express');
const router = express.Router();
const { getMyOrders, getOrderDetails, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-orders', getMyOrders);
router.get('/', getMyOrders);
router.get('/:id', getOrderDetails);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
