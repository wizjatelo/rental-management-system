/**
 * Centralized configuration for the API Gateway
 * Exports configuration settings used throughout the application
 */

const dotenv = require('dotenv');
const services = require('./services');
const cors = require('./cors');

// Load environment variables
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || '/api'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    message: 'Too many requests, please try again later.'
  },
  circuitBreaker: {
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000', 10),
    errorThreshold: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || '5', 10),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '60000', 10)
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  services,
  cors,
  apiPrefix: process.env.API_PREFIX || '/api'
};