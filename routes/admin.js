/**
 * Admin Routes
 * Handles admin-specific routes and data aggregation
 */

const express = require('express');
const router = express.Router();
const { auth, roleBasedAccess } = require('../middleware');
const { adminAggregator } = require('../services');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');

// All admin routes require authentication and admin role
router.use(auth.protect());
router.use(roleBasedAccess.requireAdmin);

/**
 * Get system stats
 */
router.get('/stats', async (req, res, next) => {
  try {
    logger.info('Admin stats request', {
      requestId: requestId.getRequestId(req),
      userId: req.user.id
    });
    
    const stats = await adminAggregator.getSystemStats(req);
    
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get payment reports
 */
router.get('/reports', async (req, res, next) => {
  try {
    logger.info('Admin reports request', {
      requestId: requestId.getRequestId(req),
      userId: req.user.id,
      query: req.query
    });
    
    const reports = await adminAggregator.getPaymentReports(req, req.query);
    
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: reports
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get dashboard data
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    logger.info('Admin dashboard request', {
      requestId: requestId.getRequestId(req),
      userId: req.user.id
    });
    
    const dashboardData = await adminAggregator.getDashboardData(req);
    
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;