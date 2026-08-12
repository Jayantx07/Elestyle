const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminFeatureHighlightController = require('../controllers/adminFeatureHighlightController');

const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(adminFeatureHighlightController.getAdminFeatureHighlights)
  .post(upload.single('image'), adminFeatureHighlightController.createFeatureHighlight);

router.route('/reorder')
  .post(adminFeatureHighlightController.reorderFeatureHighlights);

router.route('/:id')
  .put(upload.single('image'), adminFeatureHighlightController.updateFeatureHighlight)
  .delete(adminFeatureHighlightController.deleteFeatureHighlight);

router.route('/:id/status')
  .patch(adminFeatureHighlightController.updateFeatureHighlightStatus);

module.exports = router;
