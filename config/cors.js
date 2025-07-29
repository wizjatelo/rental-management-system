/**
 * CORS configuration
 * Contains allowed origins and CORS options
 */

// Parse allowed origins from environment variable
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://your-frontend-domain.com'];

// Supported frontend routes that should be allowed for CORS
const supportedRoutes = [
  '/login',
  '/register',
  '/dashboard',
  '/properties',
  '/leases',
  '/payments',
  '/maintenance',
  '/notifications',
  '/admin/dashboard',
  '/chat'
];

module.exports = {
  allowedOrigins,
  supportedRoutes,
  corsOptions: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }
};