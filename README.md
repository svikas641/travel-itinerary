# Travel Itinerary API

A comprehensive REST API for managing travel itineraries with authentication, caching, and collaboration features.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📝 **CRUD Operations** - Create, read, update, and delete travel itineraries
- 👥 **Collaboration** - Share itineraries and add collaborators
- 🚀 **Performance** - Redis caching for improved response times
- 📚 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🧪 **Testing** - Comprehensive test suite with Jest
- 🔒 **Security** - Rate limiting, input validation, and security headers
- 📊 **Pagination** - Efficient data pagination for large datasets

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd travel-itinerary
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/travel_itinerary
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   REDIS_URL=redis://localhost:6379
   REDIS_PASSWORD=
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start MongoDB and Redis**

   ```bash
   # Start MongoDB (if not running as a service)
   mongod

   # Start Redis (if not running as a service)
   redis-server
   ```

5. **Run the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password
- `DELETE /api/auth/account` - Delete user account

### Itineraries

- `GET /api/itineraries` - Get user's itineraries
- `POST /api/itineraries` - Create new itinerary
- `GET /api/itineraries/:id` - Get single itinerary
- `PUT /api/itineraries/:id` - Update itinerary
- `DELETE /api/itineraries/:id` - Delete itinerary
- `POST /api/itineraries/:id/share` - Share itinerary
- `GET /api/itineraries/shared/:code` - Get shared itinerary
- `POST /api/itineraries/:id/collaborators` - Add collaborator
- `DELETE /api/itineraries/:id/collaborators/:userId` - Remove collaborator

### Public Itineraries

- `GET /api/itineraries/public` - Get public itineraries

### Health Check

- `GET /health` - API health status

## Usage Examples

Please refer to the API Documentation here - https://travel-itinerary-szjy.onrender.com/api-docs

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

```
travel-itinerary/
├── config/
│   ├── redis.js          # Redis configuration and caching functions
│   └── swagger.js        # Swagger/OpenAPI documentation setup
├── controllers/
│   ├── authController.js # Authentication controller
│   └── itineraryController.js # Itinerary controller
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling middleware
│   └── validation.js     # Input validation middleware
├── models/
│   ├── User.js           # User model
│   └── Itinerary.js      # Itinerary model
├── routes/
│   ├── auth.js           # Authentication routes
│   └── itineraries.js    # Itinerary routes
├── tests/
│   ├── setup.js          # Test setup and configuration
│   ├── auth.test.js      # Authentication tests
│   └── itinerary.test.js # Itinerary tests
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── jest.config.js        # Jest configuration
└── README.md             # This file
```

## Database Schema

### User Model

- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (user/admin)
- `preferences`: User preferences (currency, language, timezone)
- `isActive`: Account status
- `lastLogin`: Last login timestamp

### Itinerary Model

- `title`: Itinerary title
- `description`: Itinerary description
- `destination`: Destination details (country, city, coordinates)
- `startDate`/`endDate`: Trip dates
- `days`: Array of daily activities
- `budget`: Budget information
- `travelers`: List of travelers
- `tags`: Itinerary tags
- `isPublic`: Public visibility
- `isShared`: Sharing status
- `shareCode`: Unique share code
- `createdBy`: Creator user ID
- `collaborators`: List of collaborators
- `status`: Itinerary status (draft/planned/in_progress/completed/cancelled)

## Performance Optimizations

1. **Redis Caching**: Frequently accessed data is cached in Redis
2. **Database Indexing**: Optimized indexes for common queries
3. **Pagination**: Efficient pagination for large datasets
4. **Rate Limiting**: Prevents API abuse
5. **Compression**: Gzip compression for responses
6. **Connection Pooling**: MongoDB connection pooling

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt for password security
3. **Input Validation**: Comprehensive input validation
4. **Rate Limiting**: API rate limiting
5. **CORS**: Cross-origin resource sharing configuration
6. **Helmet**: Security headers
7. **SQL Injection Protection**: Mongoose ODM protection

## Environment Variables

| Variable                  | Description               | Default                                    |
| ------------------------- | ------------------------- | ------------------------------------------ |
| `PORT`                    | Server port               | 3000                                       |
| `NODE_ENV`                | Environment               | development                                |
| `MONGODB_URI`             | MongoDB connection string | mongodb://localhost:27017/travel_itinerary |
| `JWT_SECRET`              | JWT secret key            | -                                          |
| `JWT_EXPIRE`              | JWT expiration time       | 7d                                         |
| `REDIS_URL`               | Redis connection string   | redis://localhost:6379                     |
| `REDIS_PASSWORD`          | Redis password            | -                                          |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window         | 900000                                     |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window   | 100                                        |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
