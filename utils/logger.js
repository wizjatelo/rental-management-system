/**
 * Logger configuration using Winston
 * Provides structured logging with different log levels
 */

const winston = require('winston');
const { format, transports } = winston;
const { combine, timestamp, json, colorize, printf } = format;

// Define log format
const logFormat = combine(
  timestamp(),
  json()
);

// Development format with colors and readable output
const developmentFormat = combine(
  colorize(),
  timestamp(),
  printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? logFormat : developmentFormat,
  defaultMeta: { service: 'api-gateway' },
  transports: [
    // Console transport for all environments
    new transports.Console(),
    
    // File transport for production
    ...(process.env.NODE_ENV === 'production' 
      ? [
          new transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5
          }),
          new transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 10485760, // 10MB
            maxFiles: 5
          })
        ] 
      : [])
  ],
  exitOnError: false
});

// Create a stream object for Morgan integration
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

module.exports = logger;