/**
 * Entry point for the API Gateway
 * Initializes the Express application and starts the server
 */

require('dotenv').config();
const app = require('./app');
const http = require('http');
const WebSocket = require('ws');
const logger = require('./utils/logger');

// Get port from environment or default to 3000
const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/api/chat/'
});

// Handle WebSocket connections
require('./routes/websocket')(wss);

// Start server
server.listen(port, () => {
  logger.info(`API Gateway server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Give time for logs to be written
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // No need to exit here as it won't crash the app
});

module.exports = server;