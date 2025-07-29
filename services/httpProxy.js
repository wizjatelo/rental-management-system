/**
 * HTTP Proxy Service
 * Handles forwarding HTTP requests to microservices
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const { createError } = require('../middleware/errorHandler');

/**
 * Create HTTP proxy middleware for a service
 * @param {object} serviceConfig - Service configuration
 * @returns {function} Express middleware
 */
const createHttpProxy = (serviceConfig) => {
  const { url, routes } = serviceConfig;
  
  // Create proxy options
  const proxyOptions = {
    target: url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api${routes}`]: '' // Remove /api/service-name from path
    },
    logLevel: 'silent', // We'll handle logging ourselves
    onProxyReq: (proxyReq, req, res) => {
      // Add request ID to proxied request
      const reqId = requestId.getRequestId(req);
      proxyReq.setHeader('X-Request-ID', reqId);
      
      // If user authenticated, forward user ID
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        
        // Forward role if available
        if (req.user.role) {
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
      }
      
      logger.debug('Proxying request', {
        requestId: reqId,
        method: req.method,
        originalUrl: req.originalUrl,
        targetUrl: `${url}${req.path.replace(`/api${routes}`, '')}`,
        userId: req.user?.id
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.debug('Received response from service', {
        requestId: requestId.getRequestId(req),
        statusCode: proxyRes.statusCode,
        service: serviceConfig.routes.slice(1) // Remove leading slash
      });
    },
    onError: (err, req, res) => {
      const reqId = requestId.getRequestId(req);
      
      logger.error('Proxy error', {
        requestId: reqId,
        error: err.message,
        service: serviceConfig.routes.slice(1),
        method: req.method,
        url: req.originalUrl
      });
      
      // Record error in circuit breaker if available
      if (req.circuitBreaker) {
        req.circuitBreaker.fire().catch(() => {
          logger.debug('Circuit breaker registered error', {
            requestId: reqId,
            service: serviceConfig.routes.slice(1)
          });
        });
      }
      
      // Don't send error response if headers already sent
      if (res.headersSent) return;
      
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        status: 'error',
        message: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
        requestId: reqId
      });
    }
  };
  
  return createProxyMiddleware(proxyOptions);
};

/**
 * Make a direct HTTP request to a service
 * @param {string} serviceName - Name of service to call
 * @param {string} method - HTTP method
 * @param {string} path - Path to append to service URL
 * @param {object} data - Request body data
 * @param {object} headers - Additional headers
 * @param {string} reqId - Request ID for tracking
 * @returns {Promise<object>} Service response
 */
const makeServiceRequest = async (serviceName, method, path, data = null, headers = {}, reqId) => {
  const serviceConfig = config.services[serviceName];
  
  if (!serviceConfig || !serviceConfig.url) {
    throw createError(`Service ${serviceName} not found or misconfigured`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  
  // Prepare URL
  const url = `${serviceConfig.url}${path}`;
  
  // Prepare headers
  const requestHeaders = {
    'Content-Type': 'application/json',
    'X-Request-ID': reqId,
    ...headers
  };
  
  try {
    logger.debug('Making service request', {
      service: serviceName,
      method,
      url,
      requestId: reqId
    });
    
    const response = await axios({
      method,
      url,
      data,
      headers: requestHeaders,
      timeout: config.requestTimeout
    });
    
    logger.debug('Service request successful', {
      service: serviceName,
      statusCode: response.status,
      requestId: reqId
    });
    
    return response.data;
  } catch (error) {
    // Log the error
    logger.error('Service request failed', {
      service: serviceName,
      method,
      url,
      error: error.message,
      statusCode: error.response?.status,
      requestId: reqId
    });
    
    // If we have a response from the service, forward it
    if (error.response) {
      throw createError(
        error.response.data?.message || ERROR_MESSAGES.SERVICE_UNAVAILABLE,
        error.response.status,
        error.response.data
      );
    }
    
    // Otherwise, throw a generic error
    throw createError(
      ERROR_MESSAGES.SERVICE_UNAVAILABLE,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      { originalError: error.message }
    );
  }
};

module.exports = {
  createHttpProxy,
  makeServiceRequest
};