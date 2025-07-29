/**
 * User Routes
 * Handles user-related routes
 */

const express = require('express');
const router = express.Router();
const { httpProxy } = require('../services');
const { auth, rateLimiting } = require('../middleware');
const serviceConfig = require('../config/services').user;

// Apply authentication to user routes
router.use(auth.protect());

// Apply rate limiting
router.use(rateLimiting.standardLimiter);

// User routes
router.get('/me', httpProxy.createHttpProxy(serviceConfig));
router.put('/me', httpProxy.createHttpProxy(serviceConfig));

// Role assignment (admin only)
router.post('/assign-role', auth.protect(), httpProxy.createHttpProxy(serviceConfig));

module.exports = router;