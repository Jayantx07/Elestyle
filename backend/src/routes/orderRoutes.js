const express = require('express');
const router = express.Router();
const { getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-orders', getMyOrders);

module.exports = router;
