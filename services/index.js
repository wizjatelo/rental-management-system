/**
 * Services module exports
 * Centralizes access to all service functions
 */

const httpProxy = require('./httpProxy');
const websocketProxy = require('./websocketProxy');
const serviceDiscovery = require('./serviceDiscovery');
const circuitBreaker = require('./circuitBreaker');
const adminAggregator = require('./adminAggregator');

module.exports = {
  httpProxy,
  websocketProxy,
  serviceDiscovery,
  circuitBreaker,
  adminAggregator
};