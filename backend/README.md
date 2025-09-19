# Learning Platform Backend

A comprehensive backend server for a learning platform with MongoDB integration, user authentication, and activity tracking.

## Features

- **User Authentication**: Registration, login, logout with JWT tokens
- **Activity Tracking**: Comprehensive logging of all user activities
- **MongoDB Integration**: Robust database models and connections
- **Security**: Password hashing, JWT authentication, role-based access control
- **API Endpoints**: RESTful API for all platform operations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `env.example` to `.env`
   - Update the values according to your setup

4. **MongoDB Setup:**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Update `.env` with: `MONGODB_URI=mongodb://localhost:27017/learning-platform`

   **Option B: MongoDB Atlas (Cloud)**
   - Create MongoDB Atlas account
   - Create a cluster
   - Get connection string
   - Update `.env` with your Atlas connection string

5. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/learning-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Health Check
- `GET /api/health` - Server health status

## Database Models

### User Model
- Username, email, password
- First name, last name
- Role (student, instructor, admin)
- Profile picture
- Login tracking (last login, login count)
- Timestamps

### Activity Model
- User ID reference
- Activity type (login, logout, course view, etc.)
- Description and metadata
- IP address and user agent
- Session tracking
- Timestamps and duration

### Course Model
- Title, description, instructor
- Category and difficulty level
- Videos and assessments
- Student enrollment tracking
- Progress monitoring
- Ratings and reviews

## Activity Tracking

The system automatically tracks:
- User logins and logouts
- Course views and enrollments
- Video watching sessions
- Assessment completions
- Profile updates
- Password changes
- And many more activities

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Error handling and logging

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Testing the API

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Register a new user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for Atlas

2. **Port Already in Use:**
   - Change PORT in `.env`
   - Kill existing process on port 5000

3. **JWT Errors:**
   - Ensure JWT_SECRET is set in `.env`
   - Check token format in Authorization header

### Logs

Check console output for:
- Database connection status
- API request logs
- Error messages
- Activity tracking logs

## Next Steps

- Add more API endpoints for courses, assessments, etc.
- Implement file upload for course materials
- Add real-time notifications
- Implement analytics and reporting
- Add admin dashboard endpoints
