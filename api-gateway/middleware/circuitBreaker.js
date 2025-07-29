/**
 * Circuit breaker middleware
 * Prevents cascading failures by stopping requests to failing services
 */

const CircuitBreaker = require('opossum');
const { HTTP_STATUS, CIRCUIT_STATES, ERROR_MESSAGES } = require('../utils/constants');
const config = require('../config');
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');

// Store circuit breakers for each service
const circuitBreakers = new Map();

/**
 * Create a circuit breaker for a service
 * @param {string} serviceName - Name of the service
 * @returns {CircuitBreaker} Circuit breaker instance
 */
const createCircuitBreaker = (serviceName) => {
  // Circuit breaker options
  const options = {
    timeout: config.circuitBreaker.timeout,
    errorThresholdPercentage: config.circuitBreaker.errorThreshold,
    resetTimeout: config.circuitBreaker.resetTimeout,
    rollingCountTimeout: 60000, // 1 minute metrics window
    rollingCountBuckets: 10
  };
  
  // Create function that will be wrapped by circuit breaker
  // This is just a placeholder, actual execution happens in the proxy service
  const serviceFunction = () => Promise.resolve();
  
  // Create circuit breaker
  const breaker = new CircuitBreaker(serviceFunction, options);
  
  // Add event listeners
  breaker.on('open', () => {
    logger.warn(`Circuit breaker for ${serviceName} is now OPEN`, {
      service: serviceName,
      state: CIRCUIT_STATES.OPEN
    });
  });
  
  breaker.on('halfOpen', () => {
    logger.info(`Circuit breaker for ${serviceName} is now HALF-OPEN`, {
      service: serviceName,
      state: CIRCUIT_STATES.HALF_OPEN
    });
  });
  
  breaker.on('close', () => {
    logger.info(`Circuit breaker for ${serviceName} is now CLOSED`, {
      service: serviceName,
      state: CIRCUIT_STATES.CLOSED
    });
  });
  
  breaker.on('fallback', (result) => {
    logger.info(`Circuit breaker fallback for ${serviceName}`, {
      service: serviceName,
      result
    });
  });
  
  return breaker;
};

/**
 * Get or create circuit breaker for a service
 * @param {string} serviceName - Name of the service
 * @returns {CircuitBreaker} Circuit breaker instance
 */
const getCircuitBreaker = (serviceName) => {
  if (!circuitBreakers.has(serviceName)) {
    const breaker = createCircuitBreaker(serviceName);
    circuitBreakers.set(serviceName, breaker);
  }
  
  return circuitBreakers.get(serviceName);
};

/**
 * Middleware to check circuit breaker state
 * @param {string} serviceName - Name of the service
 * @returns {function} Express middleware
 */
const checkCircuitBreaker = (serviceName) => {
  return (req, res, next) => {
    const breaker = getCircuitBreaker(serviceName);
    
    // If circuit is open, return error
    if (breaker.status.state === CIRCUIT_STATES.OPEN) {
      logger.warn(`Request blocked by circuit breaker for ${serviceName}`, {
        service: serviceName,
        state: breaker.status.state,
        requestId: requestId.getRequestId(req),
        method: req.method,
        url: req.path
      });
      
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        status: 'error',
        message: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
        service: serviceName
      });
    }
    
    // Add circuit breaker to request for later use in proxy
    req.circuitBreaker = breaker;
    next();
  };
};

module.exports = {
  getCircuitBreaker,
  checkCircuitBreaker
};