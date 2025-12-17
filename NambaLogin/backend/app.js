const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.get('/', (req, res) => res.json({ message: 'Server is working!' }));
app.get('/test', (req, res) => res.json({ message: 'Test route working!' }));

app.use('/api/auth', require('./routes/authRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;