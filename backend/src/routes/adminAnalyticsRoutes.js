const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/adminAnalyticsController');

router.route('/')
  .get(getAnalytics);

module.exports = router;
