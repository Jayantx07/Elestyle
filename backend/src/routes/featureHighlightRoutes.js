const express = require('express');
const router = express.Router();
const featureHighlightController = require('../controllers/featureHighlightController');

router.get('/', featureHighlightController.getPublicFeatureHighlights);

module.exports = router;
