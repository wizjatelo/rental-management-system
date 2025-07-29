/**
 * WebSocket Routes
 * Handles WebSocket connection proxying
 */

const { websocketProxy } = require('../services');
const logger = require('../utils/logger');
const config = require('../config/services');

/**
 * Initialize WebSocket routes
 * @param {WebSocketServer} wss - WebSocket server instance
 */
const initializeWebSocketRoutes = (wss) => {
  logger.info('Initializing WebSocket routes');
  
  // Chat service
  const chatServiceConfig = config.chat;
  
  if (!chatServiceConfig) {
    logger.error('Chat service configuration not found');
    return;
  }
  
  // Create WebSocket proxy
  const chatProxy = websocketProxy.createWebSocketProxy(chatServiceConfig);
  
  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    // Route to appropriate service based on path
    if (req.url.startsWith('/api/chat')) {
      chatProxy(ws, req);
    } else {
      logger.warn(`Unknown WebSocket path: ${req.url}`);
      ws.close(4404, 'Not Found');
    }
  });
  
  logger.info('WebSocket routes initialized');
};

module.exports = initializeWebSocketRoutes;