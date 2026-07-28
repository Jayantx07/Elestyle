const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, updateCustomerStatus } = require('../controllers/adminCustomerController');

router.route('/')
  .get(getCustomers);

router.route('/:id')
  .get(getCustomerById);

router.route('/:id/status')
  .put(updateCustomerStatus);

module.exports = router;
