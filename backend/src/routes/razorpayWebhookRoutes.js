const express = require('express');
const router = express.Router();
const razorpayWebhookController = require('../controllers/razorpayWebhookController');

// We need the raw request body to compute the HMAC-SHA256 signature exactly as Razorpay sent it
router.post('/razorpay', express.raw({ type: 'application/json' }), razorpayWebhookController.handleWebhook);

module.exports = router;
