/**
 * Maintenance Routes
 * Handles maintenance-related routes with circuit breaker
 */

const express = require('express');
const router = express.Router();
const { httpProxy } = require('../services');
const { auth, circuitBreaker } = require('../middleware');
const { validationRules, validate } = require('../utils/validation');
const serviceConfig = require('../config/services').maintenance;

// All maintenance routes require authentication
router.use(auth.protect());

// Apply circuit breaker for maintenance service
router.use(circuitBreaker.checkCircuitBreaker('maintenance'));

// Maintenance routes
router.post('/request', httpProxy.createHttpProxy(serviceConfig));
router.get('/', httpProxy.createHttpProxy(serviceConfig));
router.put('/:id/status', validationRules.idParam, validate, httpProxy.createHttpProxy(serviceConfig));

module.exports = router;