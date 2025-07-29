/**
 * Service Discovery
 * Resolves service URLs and maintains service availability information
 */

const config = require('../config');
const logger = require('../utils/logger');

// Cache for service URLs
const serviceCache = new Map();

/**
 * Get service URL from configuration or environment variables
 * @param {string} serviceName - Name of the service
 * @returns {string} Service URL
 * @throws {Error} If service is not found or misconfigured
 */
const getServiceUrl = (serviceName) => {
  // Check if service URL is already cached
  if (serviceCache.has(serviceName)) {
    return serviceCache.get(serviceName);
  }
  
  // Get service config
  const serviceConfig = config.services[serviceName];
  
  if (!serviceConfig || !serviceConfig.url) {
    throw new Error(`Service ${serviceName} not found or misconfigured`);
  }
  
  // Cache the URL
  serviceCache.set(serviceName, serviceConfig.url);
  
  return serviceConfig.url;
};

/**
 * Get service configuration
 * @param {string} serviceName - Name of the service
 * @returns {object} Service configuration
 * @throws {Error} If service is not found
 */
const getServiceConfig = (serviceName) => {
  const serviceConfig = config.services[serviceName];
  
  if (!serviceConfig) {
    throw new Error(`Service ${serviceName} not found`);
  }
  
  return serviceConfig;
};

/**
 * Clear service URL cache
 * @param {string} [serviceName] - Name of the service to clear, or all if not provided
 */
const clearCache = (serviceName) => {
  if (serviceName) {
    serviceCache.delete(serviceName);
    logger.debug(`Cache cleared for ${serviceName} service`);
  } else {
    serviceCache.clear();
    logger.debug('Service cache cleared');
  }
};

/**
 * Check if a service is WebSocket-based
 * @param {string} serviceName - Name of the service
 * @returns {boolean} True if service is WebSocket-based
 */
const isWebSocketService = (serviceName) => {
  const serviceConfig = config.services[serviceName];
  return serviceConfig && serviceConfig.websocket === true;
};

/**
 * Check if a service requires authentication
 * @param {string} serviceName - Name of the service
 * @returns {boolean} True if service requires authentication
 */
const requiresAuthentication = (serviceName) => {
  const serviceConfig = config.services[serviceName];
  return serviceConfig && serviceConfig.authRequired === true;
};

/**
 * Check if a service requires circuit breaker
 * @param {string} serviceName - Name of the service
 * @returns {boolean} True if service requires circuit breaker
 */
const requiresCircuitBreaker = (serviceName) => {
  const serviceConfig = config.services[serviceName];
  return serviceConfig && serviceConfig.circuitBreakerEnabled === true;
};

/**
 * Check if a service requires rate limiting
 * @param {string} serviceName - Name of the service
 * @returns {boolean} True if service requires rate limiting
 */
const requiresRateLimiting = (serviceName) => {
  const serviceConfig = config.services[serviceName];
  return serviceConfig && serviceConfig.rateLimited === true;
};

module.exports = {
  getServiceUrl,
  getServiceConfig,
  clearCache,
  isWebSocketService,
  requiresAuthentication,
  requiresCircuitBreaker,
  requiresRateLimiting
};