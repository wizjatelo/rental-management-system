/**
 * WebSocket Proxy Service
 * Handles forwarding WebSocket connections to microservices
 */

const WebSocket = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Create WebSocket proxy for a service
 * @param {object} serviceConfig - Service configuration
 * @returns {function} WebSocket connection handler
 */
const createWebSocketProxy = (serviceConfig) => {
  const { url: serviceUrl, authRequired } = serviceConfig;
  
  return (ws, req) => {
    // Generate request ID for tracking
    const reqId = requestId.generateRequestId();
    
    logger.debug('WebSocket connection received', {
      requestId: reqId,
      path: req.url,
      service: serviceConfig.routes.slice(1)
    });
    
    // Verify JWT token if authentication required
    let user = null;
    if (authRequired) {
      // Get token from query parameters or headers
      const parsedUrl = url.parse(req.url, true);
      const token = parsedUrl.query.token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        logger.warn('WebSocket connection rejected: No authentication token', {
          requestId: reqId,
          path: req.url
        });
        
        ws.send(JSON.stringify({
          type: 'error',
          message: ERROR_MESSAGES.UNAUTHORIZED
        }));
        
        ws.close();
        return;
      }
      
      try {
        // Verify token
        user = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        logger.warn('WebSocket connection rejected: Invalid token', {
          requestId: reqId,
          error: error.message,
          path: req.url
        });
        
        ws.send(JSON.stringify({
          type: 'error',
          message: ERROR_MESSAGES.UNAUTHORIZED
        }));
        
        ws.close();
        return;
      }
    }
    
    // Parse target path from original request
    const parsedUrl = url.parse(req.url, true);
    const targetPath = parsedUrl.pathname.replace(`/api${serviceConfig.routes}`, '');
    
    // Build target URL for the service
    const targetUrl = `${serviceUrl}${targetPath}`;
    
    logger.debug('Creating WebSocket proxy connection', {
      requestId: reqId,
      targetUrl,
      userId: user?.id
    });
    
    // Create WebSocket connection to the target service
    const targetWs = new WebSocket(targetUrl, {
      headers: {
        'X-Request-ID': reqId,
        'X-User-ID': user?.id || '',
        'X-User-Role': user?.role || ''
      }
    });
    
    // Handle connection errors
    targetWs.on('error', (error) => {
      logger.error('WebSocket proxy connection error', {
        requestId: reqId,
        error: error.message,
        targetUrl
      });
      
      ws.send(JSON.stringify({
        type: 'error',
        message: ERROR_MESSAGES.SERVICE_UNAVAILABLE
      }));
      
      ws.close();
    });
    
    // Forward messages from client to service
    ws.on('message', (data) => {
      if (targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(data);
      }
    });
    
    // Forward messages from service to client
    targetWs.on('message', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      logger.debug('WebSocket client disconnected', {
        requestId: reqId,
        userId: user?.id
      });
      
      if (targetWs.readyState === WebSocket.OPEN) {
        targetWs.close();
      }
    });
    
    // Handle service disconnection
    targetWs.on('close', () => {
      logger.debug('WebSocket service disconnected', {
        requestId: reqId,
        targetUrl
      });
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
  };
};

module.exports = {
  createWebSocketProxy
};