/**
 * Rate limiting middleware
 * Restricts the number of requests from a single client
 */

const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../utils/constants');
const config = require('../config');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');

/**
 * Create rate limiter with default configuration
 * @param {object} options - Options to override defaults
 * @returns {function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: config.rateLimit.message
    },
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded', {
        requestId: requestId.getRequestId(req),
        ip: req.ip,
        path: req.path
      });
      
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(options.message);
    },
    keyGenerator: (req) => {
      // Use IP address or user ID if authenticated
      return req.user?.id || req.ip;
    }
  };
  
  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// Standard rate limiter
const standardLimiter = createRateLimiter();

// Stricter rate limiter for auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20 // 20 requests per windowMs
});

/**
 * Apply rate limiting based on route type
 * @param {string} routePath - The route path to check
 * @returns {function} Appropriate rate limiter middleware
 */
const applyRateLimiting = (routePath) => {
  if (routePath.startsWith('/auth')) {
    return authLimiter;
  }
  return standardLimiter;
};

module.exports = {
  createRateLimiter,
  standardLimiter,
  authLimiter,
  applyRateLimiting
};