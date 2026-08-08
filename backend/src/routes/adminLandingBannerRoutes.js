const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getAdminLandingBanners,
  getLandingBannerById,
  createLandingBanner,
  updateLandingBanner,
  updateLandingBannerStatus,
  reorderLandingBanners,
  deleteLandingBanner,
} = require('../controllers/adminLandingBannerController');

router.use(protect, authorizeRoles('admin'));

router.route('/')
  .get(getAdminLandingBanners)
  .post(upload.single('image'), createLandingBanner);

router.route('/reorder')
  .post(reorderLandingBanners);

router.route('/:id/status')
  .patch(updateLandingBannerStatus);

router.route('/:id')
  .get(getLandingBannerById)
  .put(upload.single('image'), updateLandingBanner)
  .delete(deleteLandingBanner);

module.exports = router;