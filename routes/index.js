/**
 * Routes index
 * Configures and exports all application routes
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const propertyRoutes = require('./property');
const leaseRoutes = require('./lease');
const paymentRoutes = require('./payment');
const maintenanceRoutes = require('./maintenance');
const notificationRoutes = require('./notification');
const adminRoutes = require('./admin');

// API health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Gateway is operational',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Mount route modules
logger.info('Mounting API routes');
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/property', propertyRoutes);
router.use('/lease', leaseRoutes);
router.use('/payment', paymentRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/notification', notificationRoutes);
router.use('/admin', adminRoutes);

// Handle 404 for API routes
router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;