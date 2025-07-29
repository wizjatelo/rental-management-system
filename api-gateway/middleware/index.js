/**
 * Middleware module exports
 * Centralizes access to all middleware functions
 */

const auth = require('./auth');
const corsMiddleware = require('./cors');
const { expresswinstonLogger, expresswinstonErrorLogger } = require('./logging');
const rateLimiting = require('./rateLimiting');
const errorHandler = require('./errorHandler');
const roleBasedAccess = require('./roleBasedAccess');
const circuitBreaker = require('./circuitBreaker');

module.exports = {
  auth,
  corsMiddleware,
  expresswinstonLogger,
  expresswinstonErrorLogger,
  rateLimiting,
  errorHandler,
  roleBasedAccess,
  circuitBreaker
};