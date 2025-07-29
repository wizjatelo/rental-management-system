/**
 * Authentication middleware
 * Verifies JWT tokens and sets user information on request object
 */

const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const config = require('../config');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');

/**
 * Middleware to verify JWT token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: 'error',
      message: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Set user info on request object
    req.user = decoded;
    
    logger.debug('User authenticated', {
      userId: decoded.id,
      requestId: requestId.getRequestId(req)
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      requestId: requestId.getRequestId(req)
    });
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: 'error',
      message: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
};

/**
 * Express middleware factory for route protection
 * @param {boolean} [required=true] - Whether authentication is required
 * @returns {function} Express middleware
 */
const protect = (required = true) => {
  return (req, res, next) => {
    // If authentication not required, skip verification
    if (!required) {
      return next();
    }
    
    return verifyToken(req, res, next);
  };
};

module.exports = {
  protect,
  verifyToken
};