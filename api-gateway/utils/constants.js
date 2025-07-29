/**
 * Application constants
 * Contains constant values used throughout the application
 */

module.exports = {
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },
  
  // User roles
  ROLES: {
    ADMIN: 'admin',
    TENANT: 'tenant',
    LANDLORD: 'landlord',
    MAINTENANCE: 'maintenance'
  },
  
  // Circuit breaker states
  CIRCUIT_STATES: {
    CLOSED: 'closed',
    OPEN: 'open',
    HALF_OPEN: 'half-open'
  },
  
  // Error messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access. Please login to continue.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
    INTERNAL_ERROR: 'An internal server error occurred. Please try again later.',
    VALIDATION_FAILED: 'Validation failed. Please check your input.'
  },
  
  // Header names
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    USER_AGENT: 'User-Agent',
    REQUEST_ID: 'X-Request-ID',
    FORWARDED_FOR: 'X-Forwarded-For'
  },
  
  // Content types
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM: 'application/x-www-form-urlencoded',
    MULTIPART: 'multipart/form-data',
    TEXT: 'text/plain'
  }
};