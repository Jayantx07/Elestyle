const express = require('express');
const router = express.Router();
const videoHighlightController = require('../controllers/videoHighlightController');

router.get('/', videoHighlightController.getPublicVideoHighlights);

module.exports = router;
