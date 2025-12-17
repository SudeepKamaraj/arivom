# Course Recommendation System

A full-stack learning platform that provides AI-powered personalized course recommendations based on user preferences, experience level, learning style, and career goals.

## 🌟 Key Features

### 🤖 AI-Powered Recommendations
- **Gemini AI Integration**: Uses Google's Generative AI for intelligent course recommendations
- **Smart Questionnaire**: 6-step interactive questionnaire to understand user preferences
- **Personalized Suggestions**: Tailored course recommendations based on:
  - Experience level (Beginner, Intermediate, Advanced)
  - Interest areas (Web Development, AI, Data Science, etc.)
  - Learning goals (Career change, skill enhancement, hobby)
  - Time commitment
  - Learning style preferences

### 👤 User Authentication & Management
- **OTP-based Sign Up**: Secure registration with email OTP verification
- **JWT Authentication**: Secure token-based authentication
- **User Profiles**: Comprehensive user profile management
- **Role-Based Access Control**: Different permissions for students and instructors

### 📚 Course Management
- **Course Database**: Extensive MongoDB-based course catalog
- **Course Metadata**: Title, description, instructor, rating, difficulty level
- **Learning Paths**: Structured learning progressions
- **Course Search & Filter**: Find courses by category, level, and language

### 💬 Interactive Chatbot
- **AI Chatbot**: Powered by Gemini AI for real-time assistance
- **Intent Recognition**: Understands user queries and provides relevant guidance
- **Video Integration**: Embedded video content support
- **Teacher Mode**: Specialized chatbot for instructors

### 💳 Payment Integration
- **Razorpay Integration**: Secure payment processing
- **Course Purchase**: One-time and subscription models
- **Transaction Management**: Complete payment history and receipts
- **Invoice Generation**: Automated billing

### 🏆 Gamification & Achievements
- **Achievement System**: Badges and certificates for course completion
- **Progress Tracking**: Visual progress indicators
- **Leaderboards**: Compare achievements with other learners
- **Assessment Tests**: Evaluate learning with coding challenges and quizzes

### 📊 Analytics & Assessments
- **Code Execution Engine**: Run and test code snippets
- **Assessment System**: Interactive coding challenges
- **Performance Metrics**: Track learning progress
- **Review System**: Rate and review courses

## 🛠️ Technology Stack

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB**: NoSQL database for scalable data storage
- **Mongoose**: ODM for MongoDB
- **Google Generative AI**: AI-powered recommendations and chatbot
- **JWT**: Secure authentication
- **Axios**: HTTP client for API calls
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting for security

### Frontend
- **React**: UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Video.js**: Video player integration
- **HTML5**: Semantic markup

### Additional Services
- **Email Service**: OTP and notification delivery
- **Razorpay API**: Payment processing

## 📦 Project Structure

```
course-recommendation-system/
├── backend/                          # Express API server
│   ├── config/                       # Configuration files
│   ├── controllers/                  # Route controllers
│   ├── models/                       # MongoDB models
│   ├── routes/                       # API routes
│   ├── middleware/                   # Custom middleware
│   ├── services/                     # Business logic services
│   └── server.js                     # Express server entry point
├── NambaLogin/                       # Frontend React application
│   ├── public/                       # Static files
│   └── src/                          # React components and logic
├── project/                          # Additional project files
├── temp_executions/                  # Temporary execution files
├── package.json                      # Root dependencies
└── .env                              # Environment variables
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SudeepKamaraj/arivom.git
   cd arivom
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```env
     # MongoDB
     MONGODB_URI=your_mongodb_connection_string
     
     # Google Generative AI
     GEMINI_API_KEY=your_gemini_api_key
     
     # Email Service
     SMTP_USER=your_email@gmail.com
     SMTP_PASS=your_app_password
     
     # Payment Gateway
     RAZORPAY_KEY_ID=your_razorpay_key
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     
     # JWT Secret
     JWT_SECRET=your_jwt_secret_key
     
     # Server Configuration
     PORT=5000
     FRONTEND_URL=http://localhost:5173
     ```

4. **Database Setup**
   ```bash
   cd backend
   node init_database.js
   node problem_seeder.js
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

6. **Start the Frontend (in a new terminal)**
   ```bash
   cd NambaLogin
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 📋 Environment Variables

### Backend `.env` Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `GEMINI_API_KEY` | Google Generative AI API key | `sk-proj-xxxxx` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |
| `SMTP_USER` | Email for OTP service | `your-email@gmail.com` |
| `SMTP_PASS` | Email app password | `your-app-password` |
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | `xxxxx` |

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor)
- `PUT /api/courses/:id` - Update course (instructor)
- `DELETE /api/courses/:id` - Delete course (admin)

### Recommendation Endpoints
- `POST /api/recommendations` - Get course recommendations
- `GET /api/recommendations/user` - Get user's saved recommendations

### Chatbot Endpoints
- `POST /api/chatbot/message` - Send message to chatbot
- `POST /api/chatbot/teacher-mode` - Teacher-specific chatbot

### Payment Endpoints
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Assessment Endpoints
- `GET /api/assessments` - Get all assessments
- `POST /api/assessments/:id/submit` - Submit assessment
- `GET /api/assessments/:id/results` - Get assessment results

## 💡 Usage

### User Registration & Login
1. New users can register with email
2. OTP is sent to registered email
3. Enter OTP to complete registration
4. Log in with credentials

### Getting Course Recommendations
1. After login, click "Get Recommendations"
2. Complete the 6-step questionnaire
3. AI generates personalized course suggestions
4. Browse and enroll in recommended courses

### Taking Courses
1. Browse available courses
2. Click "Enroll" to start learning
3. Complete lessons and assessments
4. Earn certificates upon completion

### Interactive Chatbot
1. Click the chatbot icon in the bottom right
2. Ask questions about courses or learning
3. AI provides instant assistance

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Files Available
- `test_chatbot_complete.js` - Complete chatbot testing
- `test_payment_integration.js` - Payment system testing
- `test_course_creation.js` - Course creation testing
- `test_assessment_system.js` - Assessment testing
- `test_questionnaire_system.js` - Questionnaire testing

## 📱 Demo

To test the complete flow:
```bash
node chatbot_success_demo.js
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt password encryption
- **JWT Tokens**: Secure session management
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Comprehensive input sanitization
- **Email Verification**: OTP-based verification

## 📖 Documentation

- [Course Recommendation Implementation](./COURSE_RECOMMENDATION_IMPLEMENTATION.md)
- [Chatbot Integration Guide](./CHATBOT_INTEGRATION_GUIDE.md)
- [Payment Integration Guide](./PAYMENT_INTEGRATION_COMPLETE.md)
- [OTP System Documentation](./OTP_SYSTEM_DOCUMENTATION.md)
- [Enhanced Achievement System](./ENHANCED_ACHIEVEMENT_SYSTEM.md)
- [Questionnaire Implementation](./QUESTIONNAIRE_IMPLEMENTATION_COMPLETE.md)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure IP whitelist includes your IP (for Atlas)

### API Key Errors
- Verify Gemini API key is correct
- Check API is enabled in Google Cloud Console
- Ensure API has sufficient quota

### OTP Not Received
- Check spam folder
- Verify SMTP credentials
- Check email service logs

### Payment Integration Issues
- Verify Razorpay keys are correct
- Ensure test mode is enabled for testing
- Check Razorpay merchant dashboard

## 👥 Contributors

- **Sudeep Kamaraj** - Project Lead

## 📄 License

ISC License - See LICENSE file for details

## 🔗 Repository

- GitHub: [https://github.com/SudeepKamaraj/arivom](https://github.com/SudeepKamaraj/arivom)

## 📞 Support

For issues, questions, or suggestions:
1. Open an issue on GitHub
2. Check existing documentation
3. Review test files for examples

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Live instructor sessions
- [ ] Peer collaboration features
- [ ] Certification programs
- [ ] Adaptive learning paths
- [ ] Multi-language support

---

**Last Updated**: December 2025
