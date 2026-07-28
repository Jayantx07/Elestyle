const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminDashboardController');

// GET /api/v1/admin/dashboard
router.get('/', getDashboardStats);

module.exports = router;
