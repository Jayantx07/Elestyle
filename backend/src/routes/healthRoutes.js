const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cacheManager = require('../utils/cacheManager');

let isReady = false;

// Initialize readiness flow
const checkReadiness = async () => {
  try {
    // 1. Check DB
    if (mongoose.connection.readyState !== 1) {
      return false;
    }
    // 2. Add other checks if necessary (e.g. Cache/Redis ping)
    // if (cacheManager.useRedis && !cacheManager.redisClient?.isReady) return false;
    
    isReady = true;
    return true;
  } catch (err) {
    return false;
  }
};

// Expose health and readiness
router.get('/ready', async (req, res) => {
  if (isReady || (await checkReadiness())) {
    res.status(200).json({ status: 'ok', message: 'Application is ready to receive traffic.' });
  } else {
    res.status(503).json({ status: 'error', message: 'Application is booting or unavailable.' });
  }
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

module.exports = router;
