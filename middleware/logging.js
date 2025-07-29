/**
 * Logging middleware
 * Configures request and error logging for Express
 */

const expressWinston = require('express-winston');
const winston = require('winston');
const { format } = winston;
const { combine, timestamp, json, colorize, printf } = format;
const logger = require('../utils/logger');
const requestId = require('../utils/requestId');

// Request logging middleware
const expresswinstonLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: process.env.NODE_ENV !== 'production',
  requestFilter: (req, propName) => {
    if (propName === 'headers' && req.headers.authorization) {
      const headers = { ...req.headers };
      headers.authorization = 'REDACTED';
      return headers;
    }
    return req[propName];
  },
  dynamicMeta: (req, res) => {
    return {
      requestId: requestId.getRequestId(req),
      userId: req.user ? req.user.id : null,
      ip: req.ip || req.connection.remoteAddress
    };
  }
});

// Error logging middleware
const expresswinstonErrorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  msg: '{{err.message}}',
  dynamicMeta: (req, res, err) => {
    return {
      requestId: requestId.getRequestId(req),
      userId: req.user ? req.user.id : null,
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode
    };
  }
});

module.exports = {
  expresswinstonLogger,
  expresswinstonErrorLogger
};