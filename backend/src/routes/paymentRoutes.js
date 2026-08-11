const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, getPaymentStatus, retryRazorpayPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.post('/:orderId/retry', protect, retryRazorpayPayment);
router.get('/:orderId/status', getPaymentStatus);

module.exports = router;
