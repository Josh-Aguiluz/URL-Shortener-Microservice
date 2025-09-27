require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Needed for the database
const app = express();

// --- Basic Configuration ---
const port = process.env.PORT || 3000;

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// --- Database Schema and Model ---
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: Number
});
const Url = mongoose.model('Url', urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// --- POST Route to Create Short URL (Your existing code, but now saves to DB) ---
app.post('/api/shorturl', async function(req, res) {
  const originalUrl = req.body.url;
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    let findOne = await Url.findOne({ original_url: originalUrl });
    if (findOne) {
      res.json({
        original_url: findOne.original_url,
        short_url: findOne.short_url
      });
    } else {
      const count = await Url.countDocuments({});
      const newUrl = new Url({
        original_url: originalUrl,
        short_url: count + 1
      });
      await newUrl.save();
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// --- GET Route for Redirection (This is the part that fixes the test) ---
app.get('/api/shorturl/:short_url', async function(req, res) {
  try {
    const urlParams = req.params.short_url;
    const findUrl = await Url.findOne({ short_url: urlParams });

    if (findUrl) {
      // If the URL is found, redirect to it
      return res.redirect(findUrl.original_url);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});