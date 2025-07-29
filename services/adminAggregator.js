/**
 * Admin Aggregator Service
 * Aggregates data from multiple services for admin routes
 */

const { makeServiceRequest } = require('./httpProxy');
const { executeWithBreaker } = require('./circuitBreaker');
const logger = require('../utils/logger');

/**
 * Get system stats by aggregating data from multiple services
 * @param {object} req - Express request object
 * @returns {Promise<object>} Aggregated stats
 */
const getSystemStats = async (req) => {
  const reqId = req.id;
  const userHeaders = { 'X-User-ID': req.user.id, 'X-User-Role': req.user.role };
  
  logger.info('Aggregating system stats', { requestId: reqId });
  
  try {
    // Make parallel requests to services
    const [userStats, paymentStats, propertyStats] = await Promise.all([
      executeWithBreaker(
        makeServiceRequest, 
        'user', 
        'GET', 
        '/stats', 
        null, 
        userHeaders, 
        reqId
      ),
      executeWithBreaker(
        makeServiceRequest, 
        'payment', 
        'GET', 
        '/stats', 
        null, 
        userHeaders, 
        reqId
      ),
      executeWithBreaker(
        makeServiceRequest, 
        'property', 
        'GET', 
        '/stats', 
        null, 
        userHeaders, 
        reqId
      )
    ]);
    
    // Aggregate the results
    return {
      users: userStats?.data || { count: 0 },
      payments: paymentStats?.data || { 
        totalAmount: 0, 
        paidCount: 0, 
        pendingCount: 0 
      },
      properties: propertyStats?.data || { 
        count: 0, 
        occupiedCount: 0, 
        vacantCount: 0 
      }
    };
  } catch (error) {
    logger.error('Error aggregating system stats', {
      requestId: reqId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get payment reports from payment service
 * @param {object} req - Express request object
 * @param {object} query - Query parameters for filtering reports
 * @returns {Promise<object>} Payment reports
 */
const getPaymentReports = async (req, query = {}) => {
  const reqId = req.id;
  const userHeaders = { 'X-User-ID': req.user.id, 'X-User-Role': req.user.role };
  
  logger.info('Getting payment reports', { 
    requestId: reqId,
    query
  });
  
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams(query).toString();
    const path = `/reports${queryParams ? `?${queryParams}` : ''}`;
    
    // Make request to payment service
    const reports = await executeWithBreaker(
      makeServiceRequest,
      'payment',
      'GET',
      path,
      null,
      userHeaders,
      reqId
    );
    
    return reports;
  } catch (error) {
    logger.error('Error getting payment reports', {
      requestId: reqId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get maintenance summary by aggregating data from maintenance service
 * @param {object} req - Express request object
 * @returns {Promise<object>} Maintenance summary
 */
const getMaintenanceSummary = async (req) => {
  const reqId = req.id;
  const userHeaders = { 'X-User-ID': req.user.id, 'X-User-Role': req.user.role };
  
  logger.info('Getting maintenance summary', { requestId: reqId });
  
  try {
    // Make request to maintenance service
    const summary = await executeWithBreaker(
      makeServiceRequest,
      'maintenance',
      'GET',
      '/summary',
      null,
      userHeaders,
      reqId
    );
    
    return summary;
  } catch (error) {
    logger.error('Error getting maintenance summary', {
      requestId: reqId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get comprehensive dashboard data by aggregating from multiple services
 * @param {object} req - Express request object
 * @returns {Promise<object>} Dashboard data
 */
const getDashboardData = async (req) => {
  const reqId = req.id;
  
  logger.info('Aggregating dashboard data', { requestId: reqId });
  
  try {
    // Get system stats and maintenance summary in parallel
    const [stats, maintenanceSummary] = await Promise.all([
      getSystemStats(req),
      getMaintenanceSummary(req)
    ]);
    
    // Combine the results
    return {
      stats,
      maintenance: maintenanceSummary,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error aggregating dashboard data', {
      requestId: reqId,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  getSystemStats,
  getPaymentReports,
  getMaintenanceSummary,
  getDashboardData
};