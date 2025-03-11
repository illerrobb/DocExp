const express = require('express');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables for client-side
const clientEnv = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PYTHON_SERVICE_URL: process.env.PYTHON_SERVICE_URL || 'http://localhost:5000'
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve environment variables to client
app.get('/env.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`window.process = { env: ${JSON.stringify(clientEnv)} };`);
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
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Python service URL:', process.env.PYTHON_SERVICE_URL || 'not configured');
});
