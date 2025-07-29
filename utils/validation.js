/**
 * Input validation utilities
 * Provides functions for validating and sanitizing input
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Check validation results and return errors if any
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 * @returns {object|void} Error response or continues to next middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Common validation rules for routes
 */
const validationRules = {
  // Authentication validations
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  
  // ID parameter validation
  idParam: [
    param('id').notEmpty().withMessage('ID is required')
  ],
  
  // Property validations
  propertySearch: [
    query('location').optional(),
    query('minPrice').optional().isNumeric().withMessage('Minimum price must be a number'),
    query('maxPrice').optional().isNumeric().withMessage('Maximum price must be a number'),
    query('bedrooms').optional().isNumeric().withMessage('Bedrooms must be a number'),
    query('bathrooms').optional().isNumeric().withMessage('Bathrooms must be a number')
  ],
  
  // Sanitization helper
  sanitizeHeaders: (headers) => {
    // Create a copy of headers
    const sanitizedHeaders = { ...headers };
    
    // Remove sensitive headers
    delete sanitizedHeaders.authorization;
    delete sanitizedHeaders.cookie;
    
    return sanitizedHeaders;
  }
};

module.exports = {
  validate,
  validationRules,
  body,
  param,
  query
};