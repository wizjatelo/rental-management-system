/**
 * Notification Routes
 * Handles notification-related routes
 */

const express = require('express');
const router = express.Router();
const { httpProxy } = require('../services');
const { auth } = require('../middleware');
const { validationRules, validate } = require('../utils/validation');
const serviceConfig = require('../config/services').notification;

// All notification routes require authentication
router.use(auth.protect());

// Notification routes
router.get('/', httpProxy.createHttpProxy(serviceConfig));
router.put('/:id/read', validationRules.idParam, validate, httpProxy.createHttpProxy(serviceConfig));

module.exports = router;