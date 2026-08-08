const express = require('express');
const router = express.Router();
const { getPublicLandingBanners } = require('../controllers/adminLandingBannerController');

router.get('/', getPublicLandingBanners);

module.exports = router;