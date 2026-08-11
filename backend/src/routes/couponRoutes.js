const express = require('express');
const router = express.Router();
const { validateCoupon, autoApplyCoupon, getAvailableCoupons } = require('../controllers/couponController');
const { protectOptional, protect } = require('../middleware/auth');

// Using protectOptional to get req.user if logged in, but not block guests
router.post('/validate', protectOptional, validateCoupon);
router.post('/auto-apply', protectOptional, autoApplyCoupon);

// Get available coupons for customer
router.get('/available', protect, getAvailableCoupons);

module.exports = router;
