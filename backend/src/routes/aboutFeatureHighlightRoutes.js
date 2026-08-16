const express = require('express');
const router = express.Router();
const aboutFeatureHighlightController = require('../controllers/aboutFeatureHighlightController');

router.get('/', aboutFeatureHighlightController.getPublicAboutFeatureHighlights);

module.exports = router;
