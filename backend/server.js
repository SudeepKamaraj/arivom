const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy for IP address (important for hosting platforms)
app.set('trust proxy', 1);

// CORS Configuration
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://arivom.onrender.com',
      'https://arivom-frontend.onrender.com',
      'https://arivom.netlify.app',
      'https://arivom.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean)
  : [
      'http://localhost:5173', 
      'http://localhost:5174', 
      'http://localhost:5175', 
      'http://localhost:5176',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ];

console.log('CORS Origins:', corsOrigins);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// CORS middleware with comprehensive configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin - allowed');
      return callback(null, true);
    }
    
    // Check if the origin is in our allowed list
    if (corsOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      return callback(null, true);
    }
    
    // For production, also allow any onrender.com subdomain as fallback
    if (process.env.NODE_ENV === 'production' && origin.includes('.onrender.com')) {
      console.log('Onrender subdomain allowed:', origin);
      return callback(null, true);
    }
    
    // Temporary: Allow the specific frontend URL if not in production
    if (origin === 'https://arivom.onrender.com') {
      console.log('Frontend URL specifically allowed:', origin);
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    console.log('Available origins:', corsOrigins);
    callback(null, true); // Temporarily allow all origins for debugging
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  preflightContinue: false
}));

// Security headers
app.use((req, res, next) => {
  // Security headers only - CORS is handled by the cors middleware above
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
// app.use('/api/video-stream', require('./routes/video-stream')); // Commented out - route doesn't exist
app.use('/api/courses', require('./routes/courses'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/code', require('./routes/code'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/debug', require('./routes/debug'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5001,
    version: '1.0.0',
    cors: {
      origin: req.get('Origin'),
      frontendUrl: process.env.FRONTEND_URL
    }
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Arivom Learning Platform API',
    status: 'Running',
    version: '1.0.0',
    docs: '/api/health for health check',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0'; // Important for hosting platforms

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/api/health`);
});
