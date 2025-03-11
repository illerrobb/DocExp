const express = require('express');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables for client-side
const clientEnv = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PYTHON_SERVICE_URL: process.env.PYTHON_SERVICE_URL || 'http://localhost:5000',
  APP_NAME: 'DocGen',
  APP_VERSION: '1.0.0'
};

// Middleware
app.use(cors());
app.use(express.json());

// Debug logging for requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files with proper caching
app.use(express.static(path.join(__dirname), {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Serve environment variables to client
app.get('/env.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.set('Cache-Control', 'no-store'); // Don't cache environment variables
  res.send(`window.process = { env: ${JSON.stringify(clientEnv)} };`);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    pythonServiceUrl: process.env.PYTHON_SERVICE_URL || 'not configured',
    hostname: req.hostname,
    serverTime: new Date().toISOString()
  });
});

// API routes
app.get('/api/pythonStatus', async (req, res) => {
  try {
    const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${pythonUrl}/status`);
      if (response.ok) {
        const data = await response.json();
        return res.json({ available: true, status: data });
      } else {
        return res.json({ available: false, error: `Status code: ${response.status}` });
      }
    } catch (error) {
      return res.json({ 
        available: false, 
        error: error.message,
        hint: 'Python service may not be running'
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle root route explicitly
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve index.html for all other non-API routes to support SPA routing
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Skip health check
  if (req.path === '/health') {
    return next();
  }
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node.js frontend server running at http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Python service URL:', process.env.PYTHON_SERVICE_URL || 'not configured');
});
