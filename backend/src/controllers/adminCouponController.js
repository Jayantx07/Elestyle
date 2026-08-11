const Coupon = require('../models/Coupon');
const eventService = require('../services/eventService');

// @desc    Get all coupons
// @route   GET /api/v1/admin/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    // Add "status" field for frontend compatibility
    const mappedCoupons = coupons.map(c => {
      const doc = c.toObject();
      doc.status = doc.isActive ? 'Active' : 'Expired';
      return doc;
    });

    res.status(200).json({ success: true, data: mappedCoupons });
  } catch (error) {
    console.error('Failed to get coupons', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single coupon
// @route   GET /api/v1/admin/coupons/:id
// @access  Private/Admin
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    
    const doc = coupon.toObject();
    doc.status = doc.isActive ? 'Active' : 'Expired';

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error('Failed to get coupon', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new coupon
// @route   POST /api/v1/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    // Map status from frontend to isActive
    const payload = { ...req.body };
    if (payload.status === 'Active') payload.isActive = true;
    else if (payload.status === 'Expired') payload.isActive = false;

    const coupon = await Coupon.create(payload);
    eventService.dispatchInvalidation('catalog', 'coupon');
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.error('Failed to create coupon', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/v1/admin/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.status === 'Active') payload.isActive = true;
    else if (payload.status === 'Expired') payload.isActive = false;

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    eventService.dispatchInvalidation('catalog', 'coupon', coupon._id);
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error('Failed to update coupon', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/admin/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    eventService.dispatchInvalidation('catalog', 'coupon', req.params.id);
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Failed to delete coupon', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
