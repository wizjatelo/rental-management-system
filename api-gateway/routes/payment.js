/**
 * Payment Routes
 * Handles payment-related routes with circuit breaker
 */

const express = require('express');
const router = express.Router();
const { httpProxy } = require('../services');
const { auth, circuitBreaker } = require('../middleware');
const { validationRules, validate } = require('../utils/validation');
const serviceConfig = require('../config/services').payment;

// All payment routes require authentication
router.use(auth.protect());

// Apply circuit breaker for payment service
router.use(circuitBreaker.checkCircuitBreaker('payment'));

// Payment routes
router.post('/pay', httpProxy.createHttpProxy(serviceConfig));
router.get('/invoices', httpProxy.createHttpProxy(serviceConfig));
router.get('/history', httpProxy.createHttpProxy(serviceConfig));
router.post('/refund', httpProxy.createHttpProxy(serviceConfig));

module.exports = router;