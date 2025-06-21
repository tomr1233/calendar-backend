// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your production domains
app.use(cors({
  origin: [
    'https://expressnext.app',
    'https://expressnext.netlify.app',
    'http://localhost:3000', 
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Calendar slots proxy endpoint
app.get('/api/calendar/slots', async (req, res) => {
  try {
    const { input } = req.query;
    
    if (!input) {
      return res.status(400).json({ error: 'Missing input parameter' });
    }

    const response = await fetch(
      `https://calendar.expressnext.app/api/trpc/slots/getSchedule?input=${input}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar slots',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📅 Calendar API available at /api/calendar/slots`);
});