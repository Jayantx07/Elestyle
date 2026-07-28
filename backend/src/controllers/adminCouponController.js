exports.getCoupons = async (req, res) => {
  try {
    const coupons = [
      { _id: 'C-001', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, minPurchaseAmount: 50, expiryDate: '2026-08-31T23:59:59Z', status: 'Active' },
      { _id: 'C-002', code: 'WELCOME10', discountType: 'fixed', discountValue: 10, minPurchaseAmount: 0, expiryDate: '2026-12-31T23:59:59Z', status: 'Active' },
      { _id: 'C-003', code: 'EXPIRED15', discountType: 'percentage', discountValue: 15, minPurchaseAmount: 20, expiryDate: '2025-12-31T23:59:59Z', status: 'Expired' },
    ];
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCouponById = async (req, res) => {
  res.status(200).json({ success: true, data: { _id: req.params.id, code: 'NEWCOUPON', discountType: 'percentage', discountValue: 10, minPurchaseAmount: 0, expiryDate: '', status: 'Active' } });
};

exports.createCoupon = async (req, res) => {
  res.status(201).json({ success: true, data: { _id: 'new_coupon', ...req.body } });
};

exports.updateCoupon = async (req, res) => {
  res.status(200).json({ success: true, data: { _id: req.params.id, ...req.body } });
};

exports.deleteCoupon = async (req, res) => {
  res.status(200).json({ success: true, message: 'Coupon deleted' });
};
