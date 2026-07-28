const express = require('express');
const router = express.Router();
const { getCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/adminCouponController');

router.route('/')
  .get(getCoupons)
  .post(createCoupon);

router.route('/:id')
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
