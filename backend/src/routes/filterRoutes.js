const express = require('express');
const router = express.Router();
const filterController = require('../controllers/adminFilterController');

// Public storefront endpoint to fetch enabled filter configurations
router.get('/', async (req, res) => {
  try {
    // Re-use getFilters which returns sorted filter configurations
    await filterController.getFilters(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching filters' });
  }
});

module.exports = router;
