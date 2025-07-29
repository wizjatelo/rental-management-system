/**
 * Circuit Breaker Service
 * Manages circuit breaker instances and tracks service health
 */

const CircuitBreaker = require('opossum');
const config = require('../config');
const logger = require('../utils/logger');
const { CIRCUIT_STATES } = require('../utils/constants');

// Store circuit breakers by service name
const breakers = new Map();

/**
 * Create a circuit breaker for a function
 * @param {Function} fn - The function to protect with circuit breaker
 * @param {string} serviceName - Name of the service for logging
 * @param {object} options - Circuit breaker options
 * @returns {CircuitBreaker} Circuit breaker instance
 */
const createBreaker = (fn, serviceName, options = {}) => {
  // Merge default options with provided options
  const breakerOptions = {
    timeout: config.circuitBreaker.timeout,
    errorThresholdPercentage: config.circuitBreaker.errorThreshold,
    resetTimeout: config.circuitBreaker.resetTimeout,
    rollingCountTimeout: 60000, // 1 minute metrics window
    rollingCountBuckets: 10,
    ...options
  };
  
  // Create circuit breaker
  const breaker = new CircuitBreaker(fn, breakerOptions);
  
  // Set up event handlers
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
  
  breaker.on('reject', () => {
    logger.warn(`Circuit breaker for ${serviceName} rejected request`, {
      service: serviceName,
      state: breaker.status.state
    });
  });
  
  breaker.on('timeout', (delay) => {
    logger.warn(`Circuit breaker for ${serviceName} timeout after ${delay}ms`, {
      service: serviceName,
      timeout: delay
    });
  });
  
  breaker.on('success', () => {
    logger.debug(`Circuit breaker for ${serviceName} successful request`, {
      service: serviceName,
      state: breaker.status.state
    });
  });
  
  breaker.on('failure', (error) => {
    logger.warn(`Circuit breaker for ${serviceName} failure`, {
      service: serviceName,
      error: error.message,
      state: breaker.status.state
    });
  });
  
  // Add fallback function to return service unavailable
  breaker.fallback(() => {
    logger.info(`Circuit breaker fallback for ${serviceName}`, {
      service: serviceName
    });
    
    const error = new Error(`Service ${serviceName} is temporarily unavailable`);
    error.statusCode = 503;
    throw error;
  });
  
  return breaker;
};

/**
 * Get or create circuit breaker for a service
 * @param {Function} fn - The function to protect with circuit breaker
 * @param {string} serviceName - Name of the service for logging
 * @param {object} options - Circuit breaker options
 * @returns {CircuitBreaker} Circuit breaker instance
 */
const getBreaker = (fn, serviceName, options = {}) => {
  if (!breakers.has(serviceName)) {
    const breaker = createBreaker(fn, serviceName, options);
    breakers.set(serviceName, breaker);
  }
  
  return breakers.get(serviceName);
};

/**
 * Execute a function through circuit breaker
 * @param {Function} fn - The function to execute
 * @param {string} serviceName - Name of the service for logging
 * @param {Array} args - Arguments to pass to the function
 * @returns {Promise<any>} Result of the function
 */
const executeWithBreaker = async (fn, serviceName, ...args) => {
  const breaker = getBreaker(() => fn(...args), serviceName);
  return breaker.fire();
};

/**
 * Reset a circuit breaker for a service
 * @param {string} serviceName - Name of the service
 * @returns {boolean} True if breaker was found and reset
 */
const resetBreaker = (serviceName) => {
  if (breakers.has(serviceName)) {
    breakers.get(serviceName).close();
    logger.info(`Circuit breaker for ${serviceName} manually reset`, {
      service: serviceName
    });
    return true;
  }
  return false;
};

/**
 * Get status of all circuit breakers
 * @returns {object} Object with service names as keys and status objects as values
 */
const getAllBreakerStatuses = () => {
  const statuses = {};
  
  for (const [serviceName, breaker] of breakers.entries()) {
    statuses[serviceName] = {
      state: breaker.status.state,
      stats: {
        successful: breaker.stats.successes,
        failed: breaker.stats.failures,
        rejected: breaker.stats.rejects,
        timeout: breaker.stats.timeouts
      }
    };
  }
  
  return statuses;
};

module.exports = {
  createBreaker,
  getBreaker,
  executeWithBreaker,
  resetBreaker,
  getAllBreakerStatuses
};