/**
 * Property Routes
 * Handles property-related routes
 */

const express = require('express');
const router = express.Router();
const { httpProxy } = require('../services');
const { auth, rateLimiting } = require('../middleware');
const { validationRules, validate } = require('../utils/validation');
const serviceConfig = require('../config/services').property;

// Apply rate limiting
router.use(rateLimiting.standardLimiter);

// Public property search endpoint
router.get(
  '/search',
  validationRules.propertySearch,
  validate,
  httpProxy.createHttpProxy(serviceConfig)
);

// Protected property routes
router.use(auth.protect());

// Property CRUD operations
router.get('/', httpProxy.createHttpProxy(serviceConfig));
router.post('/', httpProxy.createHttpProxy(serviceConfig));
router.get('/:id', validationRules.idParam, validate, httpProxy.createHttpProxy(serviceConfig));
router.put('/:id', validationRules.idParam, validate, httpProxy.createHttpProxy(serviceConfig));
router.delete('/:id', validationRules.idParam, validate, httpProxy.createHttpProxy(serviceConfig));

module.exports = router;