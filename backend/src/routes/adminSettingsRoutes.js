const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/adminSettingsController');

router.route('/')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
