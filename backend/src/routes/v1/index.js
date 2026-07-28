const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

const uploadRoutes = require('../uploadRoutes');
const adminDashboardRoutes = require('../adminDashboardRoutes');
const adminProductRoutes = require('../adminProductRoutes');
const adminCategoryRoutes = require('../adminCategoryRoutes');
const adminOrderRoutes = require('../adminOrderRoutes');
const adminCustomerRoutes = require('../adminCustomerRoutes');
const adminReviewRoutes = require('../adminReviewRoutes');
const adminInventoryRoutes = require('../adminInventoryRoutes');
const adminCouponRoutes = require('../adminCouponRoutes');
const adminAnalyticsRoutes = require('../adminAnalyticsRoutes');
const adminSettingsRoutes = require('../adminSettingsRoutes');

router.use('/upload', uploadRoutes);
router.use('/products', require('../productRoutes'));
router.use('/categories', require('../categoryRoutes'));
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/customers', adminCustomerRoutes);
router.use('/admin/reviews', adminReviewRoutes);
router.use('/admin/inventory', adminInventoryRoutes);
router.use('/admin/coupons', adminCouponRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);
router.use('/admin/settings', adminSettingsRoutes);

module.exports = router;
