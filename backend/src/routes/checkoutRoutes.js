const express = require('express');
const router = express.Router();
const { processOrder } = require('../controllers/checkoutController');

router.post('/process', processOrder);

module.exports = router;
