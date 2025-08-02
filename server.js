const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'https://expressnext.app'];

console.log('🌐 Allowed CORS origins:', allowedOrigins);
console.log('🔧 Environment:', process.env.NODE_ENV);

app.use(cors({
  origin: (origin, callback) => {
    console.log('📨 Request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔓 Development mode: allowing all origins');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    console.log('❌ Origin blocked:', origin);
    console.log('📋 Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ExpressNext Calendar Proxy API is running!',
    endpoints: {
      health: '/api/health',
      slots: '/api/calendar/slots'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'expressnext-calendar-proxy'
  });
});

// Calendar slots proxy endpoint
app.get('/api/calendar/slots', async (req, res) => {
  try {
    const { input } = req.query;
    
    if (!input) {
      return res.status(400).json({ error: 'Missing input parameter' });
    }

    console.log('Proxying calendar request...');
    
    const response = await axios.get(
      `https://calendar.expressnext.app/api/trpc/slots/getSchedule?input=${input}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000 // 30 second timeout
      }
    );

    res.json(response.data);
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      res.status(error.response.status).json({ 
        error: 'External API error',
        message: error.response.data 
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(504).json({ 
        error: 'No response from calendar API',
        message: 'The calendar service did not respond'
      });
    } else {
      // Something happened in setting up the request
      res.status(500).json({ 
        error: 'Failed to fetch calendar slots',
        message: error.message 
      });
    }
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📅 Calendar API available at /api/calendar/slots`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});