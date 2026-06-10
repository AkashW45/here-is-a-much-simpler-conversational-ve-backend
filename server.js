const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 8000;

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Generate 10 KB random text (alias)
app.get('/generate', (req, res) => {
  const size = 10 * 1024;
  const randomBytes = crypto.randomBytes(size);
  const textBuffer = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    textBuffer[i] = (randomBytes[i] % 95) + 32;
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(textBuffer);
});

// Generate 10 KB random text
app.get('/api/generate', (req, res) => {
  const size = 10 * 1024; // 10240 bytes
  const randomBytes = crypto.randomBytes(size);
  // Map to printable ASCII characters (32-126)
  const textBuffer = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    textBuffer[i] = (randomBytes[i] % 95) + 32;
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(textBuffer);
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all for SPA (optional for single page)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
