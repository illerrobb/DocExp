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
  APP_VERSION: '1.0.0',
  RENDER_DOMAIN: 'docexp.onrender.com',
  API_RENDER_DOMAIN: 'docexp-api.onrender.com'
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper caching
app.use(express.static(path.join(__dirname), {
  maxAge: '1h', // Cache static assets for 1 hour
}));

// Serve environment variables to client
app.get('/env.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.set('Cache-Control', 'no-store'); // Don't cache environment variables
  res.send(`window.process = { env: ${JSON.stringify(clientEnv)} };`);
});

// Health check with detailed info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    pythonServiceUrl: process.env.PYTHON_SERVICE_URL || 'not configured',
    hostname: req.hostname,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    serverTime: new Date().toISOString()
  });
});

// API routes
app.get('/api/startPythonServer', (req, res) => {
  try {
    exec('cd server && python server.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Python server error: ${error}`);
        return res.status(500).json({ error: 'Failed to start Python server' });
      }
      console.log(`Python server output: ${stdout}`);
      res.json({ success: true, message: 'Python server started' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pythonStatus', async (req, res) => {
  try {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    pythonServiceUrl: process.env.PYTHON_SERVICE_URL || 'not configured' 
  });
});

// IMPORTANT: This needs to be AFTER all other routes
// Serve index.html for all other routes to support SPA routing
app.get('*', (req, res) => {
  // Log the route being requested to help with debugging
  console.log(`Serving index.html for route: ${req.path}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Python service URL:', process.env.PYTHON_SERVICE_URL || 'not configured');
});
