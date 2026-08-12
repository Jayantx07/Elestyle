const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminVideoHighlightController = require('../controllers/adminVideoHighlightController');

const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(adminVideoHighlightController.getAdminVideoHighlights)
  .post(upload.single('video'), adminVideoHighlightController.createVideoHighlight);

router.route('/reorder')
  .post(adminVideoHighlightController.reorderVideoHighlights);

router.route('/:id')
  .put(upload.single('video'), adminVideoHighlightController.updateVideoHighlight)
  .delete(adminVideoHighlightController.deleteVideoHighlight);

router.route('/:id/status')
  .patch(adminVideoHighlightController.updateVideoHighlightStatus);

module.exports = router;
