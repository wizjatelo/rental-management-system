/**
 * Request ID generation and middleware
 * Attaches a unique ID to each request for tracking
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique request ID
 * @returns {string} Unique request ID
 */
const generateRequestId = () => {
  return uuidv4();
};

/**
 * Middleware to add request ID to each request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const middleware = (req, res, next) => {
  // Get existing request ID from headers or generate new one
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  // Add request ID to request object
  req.id = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Get request ID from request object
 * @param {object} req - Express request object
 * @returns {string} Request ID
 */
const getRequestId = (req) => {
  return req.id || 'unknown';
};

module.exports = {
  generateRequestId,
  middleware,
  getRequestId
};