/**
 * Role-based access control middleware
 * Restricts access to routes based on user roles
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');

/**
 * Middleware to check if user has required role
 * @param {string|string[]} roles - Required role(s) for access
 * @returns {function} Express middleware
 */
const checkRole = (roles) => {
  // Convert single role to array
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    // Ensure user is authenticated and has role property
    if (!req.user || !req.user.role) {
      logger.warn('Role check failed: No user or role', {
        requestId: requestId.getRequestId(req),
        path: req.path
      });
      
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
    }
    
    // Check if user's role is in required roles
    if (!requiredRoles.includes(req.user.role)) {
      logger.warn('Role check failed: Insufficient permissions', {
        requestId: requestId.getRequestId(req),
        userRole: req.user.role,
        requiredRoles,
        userId: req.user.id,
        path: req.path
      });
      
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        message: ERROR_MESSAGES.FORBIDDEN
      });
    }
    
    // User has required role
    logger.debug('Role check passed', {
      requestId: requestId.getRequestId(req),
      userRole: req.user.role,
      userId: req.user.id,
      path: req.path
    });
    
    next();
  };
};

/**
 * Middleware to check if user is an admin
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {void}
 */
const requireAdmin = (req, res, next) => {
  return checkRole('admin')(req, res, next);
};

module.exports = {
  checkRole,
  requireAdmin
};