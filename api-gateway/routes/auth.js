/**
 * Auth Routes
 * Handles authentication-related routes
 */

const express = require('express');
const router = express.Router();
const { httpProxy } = require('../services');
const { rateLimiting } = require('../middleware');
const serviceConfig = require('../config/services').auth;
const { validationRules, validate } = require('../utils/validation');

// Apply rate limiting to auth routes
router.use(rateLimiting.authLimiter);

// Register route with validation
router.post(
  '/register',
  validationRules.register,
  validate,
  httpProxy.createHttpProxy(serviceConfig)
);

// Login route with validation
router.post(
  '/login',
  validationRules.login,
  validate,
  httpProxy.createHttpProxy(serviceConfig)
);

// Other auth routes
router.post('/logout', httpProxy.createHttpProxy(serviceConfig));
router.post('/change-password', httpProxy.createHttpProxy(serviceConfig));

module.exports = router;