const couponService = require('../services/couponService');

// @desc    Validate a coupon and return authoritative pricing
// @route   POST /api/v1/coupons/validate
// @access  Public (Guest allowed depending on coupon)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, items } = req.body;
    
    if (!code || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Code and items are required' });
    }

    // Determine customerId from authentication middleware if available
    const customerId = req.user ? req.user._id : null;

    const result = await couponService.validateAndCalculate(code, items, customerId);
    
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ success: false, message: 'Server Error during coupon validation' });
  }
};

// @desc    Find and return best auto-apply coupon
// @route   POST /api/v1/coupons/auto-apply
// @access  Public
exports.autoApplyCoupon = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items are required' });
    }

    const customerId = req.user ? req.user._id : null;

    const result = await couponService.findBestAutoApplyCoupon(items, customerId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'No eligible auto-apply coupons found' });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Auto-apply coupon error:', error);
    res.status(500).json({ success: false, message: 'Server Error during auto-apply' });
  }
};

// @desc    Get eligible coupons for the current user
// @route   GET /api/v1/coupons/available
// @access  Private
exports.getAvailableCoupons = async (req, res) => {
  try {
    const customerId = req.user ? req.user._id : null;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const coupons = await couponService.getEligibleCoupons(customerId);

    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Get available coupons error:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching available coupons' });
  }
};
