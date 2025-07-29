/**
 * Service configuration for microservices
 * Contains routing information, URL configuration, and access requirements
 */

module.exports = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    routes: '/auth',
    methods: ['POST'],
    endpoints: ['/register', '/login', '/logout', '/change-password'],
    public: true,
    rateLimited: true
  },
  user: {
    url: process.env.USER_SERVICE_URL || 'http://user-service:3002',
    routes: '/user',
    methods: ['GET', 'PUT', 'POST'],
    endpoints: ['/me', '/assign-role'],
    authRequired: true,
    rateLimited: true
  },
  property: {
    url: process.env.PROPERTY_SERVICE_URL || 'http://property-service:3003',
    routes: '/property',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    endpoints: ['/', '/search', '/:id'],
    authRequired: true,
    rateLimited: true
  },
  lease: {
    url: process.env.LEASE_SERVICE_URL || 'http://lease-service:3004',
    routes: '/lease',
    methods: ['GET', 'POST', 'PUT'],
    endpoints: ['/apply', '/applications', '/approve/:id', '/reject/:id', '/leases', '/terminate/:id'],
    authRequired: true
  },
  payment: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005',
    routes: '/payment',
    methods: ['GET', 'POST'],
    endpoints: ['/pay', '/invoices', '/history', '/refund'],
    authRequired: true,
    circuitBreakerEnabled: true
  },
  maintenance: {
    url: process.env.MAINTENANCE_SERVICE_URL || 'http://maintenance-service:3006',
    routes: '/maintenance',
    methods: ['GET', 'POST', 'PUT'],
    endpoints: ['/request', '/', '/:id/status'],
    authRequired: true,
    circuitBreakerEnabled: true
  },
  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3007',
    routes: '/notification',
    methods: ['GET', 'PUT'],
    endpoints: ['/', '/:id/read'],
    authRequired: true
  },
  chat: {
    url: process.env.CHAT_SERVICE_URL || 'ws://chat-service:3008',
    routes: '/chat',
    websocket: true,
    authRequired: true
  },
  admin: {
    routes: '/admin',
    internalProxy: true,
    roleRequired: 'admin',
    endpoints: ['/stats', '/reports']
  }
};