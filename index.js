require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST route for URL Shortener
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Correct and complete URL validation regex
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  res.json({
    original_url: originalUrl,
    short_url: 1 // This is still a placeholder
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});