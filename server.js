const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const csv = require('csv-parser');

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

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  let userFound = null;
  fs.createReadStream(path.join(__dirname, 'users.csv'))
    .pipe(csv())
    .on('data', (row) => {
      if (row.email === email && row.password === password) {
        userFound = row;
      }
    })
    .on('end', () => {
      if (userFound) {
        console.log('User found:', userFound);
        req.session.user = {
          userId: userFound.userId,
          name: userFound.name,
          email: userFound.email,
          salt: userFound.salt,
          dateJoined: userFound.dateJoined,
          latitude: userFound.latitude,
          longitude: userFound.longitude,
          searchGroupTags: userFound.searchGroupTags,
          searchCategoryTags: userFound.searchCategoryTags,
          daysTimesOfInterest: userFound.daysTimesOfInterest,
          eventsReviewed: userFound.eventsReviewed,
          eventsRegisteredInterest: userFound.eventsRegisteredInterest,
          eventsSignedUpFor: userFound.eventsSignedUpFor,
          eventsAttended: userFound.eventsAttended
        };
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
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

// Basic API route (optional, can be removed if not needed)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Fallback to index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
