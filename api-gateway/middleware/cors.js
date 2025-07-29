/**
 * CORS middleware
 * Configures Cross-Origin Resource Sharing for the API
 */

const cors = require('cors');
const config = require('../config/cors');
const logger = require('../utils/logger');

// Create CORS middleware with dynamic origin checking
const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (config.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS request rejected: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

module.exports = corsMiddleware;