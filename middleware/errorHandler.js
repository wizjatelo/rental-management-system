/**
 * Global error handling middleware
 * Processes all errors in a consistent format
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');

/**
 * Global error handler for Express
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const requestIdValue = requestId.getRequestId(req);
  
  // Log error with context
  logger.error('Error handling request', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: requestIdValue,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id
  });
  
  // Custom error response
  const errorResponse = {
    status: 'error',
    message: err.message || ERROR_MESSAGES.INTERNAL_ERROR,
    requestId: requestIdValue,
  };
  
  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || {};
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Create a custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {object} details - Additional error details
 * @returns {Error} Custom error object
 */
const createError = (message, statusCode, details = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

module.exports = errorHandler;
module.exports.createError = createError;