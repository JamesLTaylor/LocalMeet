const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const csv = require('csv-parser');
const Api = require('./model/Api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: 'localmeet_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create an instance of the API class on app startup
const api = new Api({ csvDir: __dirname+"/model/TestDB" });
// in future connect to MySQL

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  api.getUserByEmail(email, password)
    .then(user => {
      if (user) {
        req.session.user = user;
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    })
    .catch(err => {
      console.error('Error during login:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out' });
  });
});

// todo: implement an endpoint to just the user name.
// Session info endpoint
app.get('/api/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// Events endpoint with filtering by date and location
app.get('/api/events', async (req, res) => {
  try {
    const { startDate, endDate, lat, lng, distance } = req.query;
    let location = undefined;
    if (lat && lng) {
      location = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
    }
    const events = await api.getEvents({
      startDate: startDate || new Date(Date.now()), // default: today`
      endDate: endDate || new Date(Date.now() + 60*24*60*60*1000),    // default: 2 months ahead
      location,
      distance: distance ? parseFloat(distance) : undefined
    });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, message: 'Error fetching events' });
  }
});

// Category tags endpoint
app.get('/api/category-tags', async (req, res) => {
  try {
    const tags = await api.getCategoryTags();
    res.json(tags);
  } catch (err) {
    console.error('Error fetching category tags:', err);
    res.status(500).json({ success: false, message: 'Error fetching category tags' });
  }
});

// Fallback to index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
