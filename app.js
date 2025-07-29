/**
 * Main Express application configuration
 * Sets up middleware and routes
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { expresswinstonLogger, expresswinstonErrorLogger } = require('./middleware/logging');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const config = require('./config');
const requestId = require('./utils/requestId');

// Initialize express app
const app = express();

// Security headers
app.use(helmet());

// Request ID for tracking
app.use(requestId.middleware);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS configuration
app.use(corsMiddleware);

// Request logging
app.use(expresswinstonLogger);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use(config.apiPrefix, routes);

// Error logging
app.use(expresswinstonErrorLogger);

// Global error handler
app.use(errorHandler);

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
    path: req.path
  });
});

module.exports = app;