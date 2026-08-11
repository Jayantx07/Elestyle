const express = require('express');
const router = express.Router();

const healthRoutes = require('../healthRoutes');
const eventRoutes = require('../eventRoutes');

router.use('/health', healthRoutes);
router.use('/events', eventRoutes);

const uploadRoutes = require('../uploadRoutes');
const adminDashboardRoutes = require('../adminDashboardRoutes');
const reviewStandaloneRoutes = require('../reviewStandaloneRoutes');
const checkoutRoutes = require('../checkoutRoutes');
const adminProductRoutes = require('../adminProductRoutes');
const adminCategoryRoutes = require('../adminCategoryRoutes');
const adminOrderRoutes = require('../adminOrderRoutes');
const adminCustomerRoutes = require('../adminCustomerRoutes');
const adminReviewRoutes = require('../adminReviewRoutes');
const adminInventoryRoutes = require('../adminInventoryRoutes');
const adminCouponRoutes = require('../adminCouponRoutes');
const adminAnalyticsRoutes = require('../adminAnalyticsRoutes');
const adminSettingsRoutes = require('../adminSettingsRoutes');
const adminSubCategoryRoutes = require('../adminSubCategoryRoutes');
const adminFilterRoutes = require('../adminFilterRoutes');
const adminLandingBannerRoutes = require('../adminLandingBannerRoutes');
const landingBannerRoutes = require('../landingBannerRoutes');
const authRoutes = require('../authRoutes');
const cartRoutes = require('../cartRoutes');
const subCategoryRoutes = require('../subCategoryRoutes');
const filterRoutes = require('../filterRoutes');
const couponRoutes = require('../couponRoutes');

const { protect, authorizeRoles } = require('../../middleware/auth');

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/products', require('../productRoutes'));
router.use('/categories', require('../categoryRoutes'));
router.use('/subcategories', subCategoryRoutes);
router.use('/filters', filterRoutes);
router.use('/reviews', reviewStandaloneRoutes);
router.use('/landing-banners', landingBannerRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', require('../paymentRoutes'));
router.use('/orders', require('../orderRoutes'));
router.use('/wishlist', require('../wishlistRoutes'));

// Apply auth protection to all admin routes
router.use('/admin', protect, authorizeRoles('admin'));
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/subcategories', adminSubCategoryRoutes);
router.use('/admin/filters', adminFilterRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/customers', adminCustomerRoutes);
router.use('/admin/reviews', adminReviewRoutes);
router.use('/admin/inventory', adminInventoryRoutes);
router.use('/admin/coupons', adminCouponRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);
router.use('/admin/settings', adminSettingsRoutes);
router.use('/admin/landing-banners', adminLandingBannerRoutes);

module.exports = router;

