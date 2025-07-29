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

// =============================================
// Security Middleware
// =============================================
app.use(helmet());
app.use(corsMiddleware);

// =============================================
// Request Processing
// =============================================
app.use(requestId.middleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// =============================================
// Logging
// =============================================
app.use(expresswinstonLogger);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =============================================
// Routes
// =============================================
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway is running',
    version: require('./package.json').version || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    documentation: `${config.apiPrefix}/docs`,
    endpoints: {
      apiBase: config.apiPrefix,
      healthCheck: `${config.apiPrefix}/health`,
      status: `${config.apiPrefix}/status`
    }
  });
});

// Main API routes
app.use(config.apiPrefix, routes);

// =============================================
// Error Handling
// =============================================
app.use(expresswinstonErrorLogger);
app.use(errorHandler);

// 404 Not Found handler (keep this last)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
    path: req.path,
    suggestedRoutes: {
      apiRoot: config.apiPrefix,
      documentation: `${config.apiPrefix}/docs`
    }
  });
});

// =============================================
// Server Configuration
// =============================================
const startServer = () => {
  const PORT = process.env.PORT || 3000;
  return app.listen(PORT, () => {
    console.log(`
    Server running in ${process.env.NODE_ENV || 'development'} mode
    Listening on port ${PORT}
    API base URL: http://localhost:${PORT}${config.apiPrefix}
    Root endpoint: http://localhost:${PORT}/
    `);
  });
};

// Export both app and server for testing
module.exports = {
  app,
  startServer
};