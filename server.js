const express = require('express');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API route to start Python server if needed
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Catch all routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
