/**
 * Lease Routes
 * Handles lease-related routes
 */

const express = require('express');
const router = express.Router();
const { httpProxy } = require('../services');
const { auth } = require('../middleware');
const { validationRules, validate } = require('../utils/validation');
const serviceConfig = require('../config/services').lease;

// All lease routes require authentication
router.use(auth.protect());

// Lease application routes
router.post('/apply', httpProxy.createHttpProxy(serviceConfig));
router.get('/applications', httpProxy.createHttpProxy(serviceConfig));

// Lease approval/rejection (admin/landlord only)
router.put(
  '/approve/:id', 
  validationRules.idParam,
  validate,
  httpProxy.createHttpProxy(serviceConfig)
);
router.put(
  '/reject/:id',
  validationRules.idParam,
  validate,
  httpProxy.createHttpProxy(serviceConfig)
);

// Lease management
router.get('/leases', httpProxy.createHttpProxy(serviceConfig));
router.put(
  '/terminate/:id',
  validationRules.idParam,
  validate,
  httpProxy.createHttpProxy(serviceConfig)
);

module.exports = router;