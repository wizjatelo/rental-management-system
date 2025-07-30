# Property Management System API Gateway

A centralized API Gateway for the Property Management System microservices architecture. This gateway handles routing, authentication, rate limiting, circuit breaking, and WebSocket proxying for all client requests to the backend microservices.

## Features

- **Centralized Authentication**: JWT-based authentication for all protected routes
- **Role-Based Access Control**: Route protection based on user roles
- **Rate Limiting**: Prevents abuse by limiting request frequency
- **Circuit Breaker Pattern**: Prevents cascading failures in the microservices architecture
- **Request Logging**: Comprehensive logging for debugging and monitoring
- **WebSocket Proxying**: Transparent WebSocket proxy for real-time communications
- **Admin Aggregation**: Special routes that aggregate data from multiple services for admin use
- **Error Handling**: Consistent error handling and reporting
- **CORS Protection**: Configurable CORS for frontend connections

## Microservices

The API Gateway routes requests to the following microservices:

- **Authentication Service**: Handles user registration, login, and session management
- **User Service**: Manages user profiles and roles
- **Property Service**: Manages property listings and searches
- **Lease Service**: Handles lease applications, approvals, and terminations
- **Payment Service**: Processes payments and maintains invoice records
- **Maintenance Service**: Tracks maintenance requests and their status
- **Notification Service**: Manages user notifications
- **Chat Service**: WebSocket-based real-time chat service

## Architecture

The API Gateway follows a modular architecture with the following components:

- **Routes**: Define API endpoints and their handlers
- **Middleware**: Implement cross-cutting concerns like authentication and logging
- **Services**: Connect to and proxy requests to backend microservices
- **Utilities**: Provide common functionality like logging and validation

## Setup and Installation

### Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory using the provided `.env.example` as a template:

```bash
cp .env.example .env
```

Edit the `.env` file to set up your environment-specific configuration:

- Set `NODE_ENV` to `development` or `production`
- Configure `PORT` for the API Gateway
- Set up your `JWT_SECRET`
- Configure the URLs of all microservices
- Set up rate limiting and circuit breaker parameters
- Configure allowed CORS origins

### Running the Gateway

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/logout` - End a user session
- `POST /api/auth/change-password` - Change user password

### User Management

- `GET /api/user/me` - Get current user profile
- `PUT /api/user/me` - Update current user profile
- `POST /api/user/assign-role` - Assign role to user (admin only)

### Properties

- `GET /api/property/search` - Search properties (public)
- `GET /api/property/` - List properties
- `POST /api/property/` - Create a property
- `GET /api/property/:id` - Get property details
- `PUT /api/property/:id` - Update property
- `DELETE /api/property/:id` - Delete property

### Leases

- `POST /api/lease/apply` - Apply for a lease
- `GET /api/lease/applications` - List lease applications
- `PUT /api/lease/approve/:id` - Approve a lease application
- `PUT /api/lease/reject/:id` - Reject a lease application
- `GET /api/lease/leases` - List leases
- `PUT /api/lease/terminate/:id` - Terminate a lease

### Payments

- `POST /api/payment/pay` - Make a payment
- `GET /api/payment/invoices` - List invoices
- `GET /api/payment/history` - View payment history
- `POST /api/payment/refund` - Process a refund

### Maintenance

- `POST /api/maintenance/request` - Submit a maintenance request
- `GET /api/maintenance/` - List maintenance requests
- `PUT /api/maintenance/:id/status` - Update maintenance request status

### Notifications

- `GET /api/notification/` - List notifications
- `PUT /api/notification/:id/read` - Mark notification as read

### Admin

- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/reports` - Get financial reports
- `GET /api/admin/dashboard` - Get aggregated dashboard data

### WebSockets

- `/api/chat/` - WebSocket endpoint for chat service

## Error Handling

The API Gateway provides consistent error responses with the following format:

```json
{
  "status": "error",
  "message": "Error message",
  "requestId": "unique-request-id"
}
```

In development mode, additional error details are included:

```json
{
  "status": "error",
  "message": "Error message",
  "requestId": "unique-request-id",
  "stack": "Error stack trace",
  "details": {
    "additional": "error details"
  }
}
```

## Monitoring and Logging

The API Gateway provides extensive logging through Winston. Logs include:

- Request/response details
- Authentication attempts
- Service forwarding information
- Circuit breaker state changes
- Error details with context

## Circuit Breaker

The gateway implements the circuit breaker pattern to prevent cascading failures. When a service fails repeatedly, the circuit breaker "opens" and fails fast, preventing resource exhaustion.

Services with circuit breaker protection:
- Payment Service
- Maintenance Service

## Rate Limiting

To prevent abuse, the API Gateway implements rate limiting on the following routes:

- Authentication routes: 20 requests per 15 minutes
- User and Property routes: 100 requests per 15 minutes

## Development

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## Production Deployment

For production deployment, consider the following:

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2 to ensure uptime
3. Configure your reverse proxy (Nginx, Apache) to forward requests to the gateway
4. Use a secure and unique JWT_SECRET
5. Configure appropriate rate limiting for your use case
6. Enable HTTPS for all communications
 
 
