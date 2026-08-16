const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminAboutFeatureHighlightController = require('../controllers/adminAboutFeatureHighlightController');

const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(adminAboutFeatureHighlightController.getAdminAboutFeatureHighlights)
  .post(upload.single('image'), adminAboutFeatureHighlightController.createAboutFeatureHighlight);

router.route('/reorder')
  .post(adminAboutFeatureHighlightController.reorderAboutFeatureHighlights);

router.route('/:id')
  .put(upload.single('image'), adminAboutFeatureHighlightController.updateAboutFeatureHighlight)
  .delete(adminAboutFeatureHighlightController.deleteAboutFeatureHighlight);

router.route('/:id/status')
  .patch(adminAboutFeatureHighlightController.updateAboutFeatureHighlightStatus);

module.exports = router;
