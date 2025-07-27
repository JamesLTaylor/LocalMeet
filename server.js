const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const Api = require('./model/Api');
const Event = require('./model/Event');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: '50eea2c0fd8c', // update this sometimes
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create an instance of the API class on app startup
const api = new Api({ csvDir: __dirname + "/data" });


// Endpoint to check if a username exists
app.get('/api/username-exists', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Missing username' });
    }
    api.usernameExists(username).then(exists => {
      res.json({ exists });
    });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ success: false, message: 'Error checking username' });
  }
});


// Create user endpoint
app.post('/api/createUser', async (req, res) => {
  try {
    const { username, password, extraInfo } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Set username' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Set password' });
    }
    await api.usernameExists(username).then(exists => {
      if (exists) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }
    });

    const newUser = await api.appendUserToLookup(username, password);
    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Function to set user details on session
  function setDetailsOnSession(user) {
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid user' });
    }
    req.session.user = user;
    req.session.save();
    res.json({ success: true, message: 'Login successful' });
    console.log(`User ${user.username} logged in successfully`);
  }

  // Function to get user details from credentials
  function getDetailsFromCredentials(userCredentials) {
    return new Promise((resolve, reject) => {
      if (userCredentials) {
        api.getUserDetailsByFilename(userCredentials.filename)
          .then(user => {
            resolve(user);
          })
          .catch(err => {
            reject(new Error('Error fetching user details'));
          });
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  }
  api.tryLogin(username, password)
    .then(getDetailsFromCredentials)
    .then(setDetailsOnSession)
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


// Session info endpoint
app.get('/api/userName', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ name: req.session.user.username });
  } else {
    res.json({ name: null });
  }
});

// Session info endpoint
app.get('/api/userType', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ userType: req.session.user.userType });
  } else {
    res.json({ userType: null });
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

// Endpoint to create a new event (admin only)
app.post('/api/createEvent', requireLogin, async (req, res) => {
  if (!req.session.user || String(req.session.user.userType).toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
  }
  try {
    const eventData = { ...req.body };
    eventData.addedBy = req.session.user.userID; // Set the user who added    
    eventData.lastEdited = Date.now(); // Set the time when the event was last edited
    const event = Event.fromDict(eventData);
    // Check if event.date is set
    if (!event.date) {
      return res.status(400).json({ success: false, message: 'The event date must be set before it can be saved.' });
    }
    // Save event as JSON in /data/{year}/{month}/
    const eventDate = new Date(event.date);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const dirPath = path.join(__dirname, 'data', String(year), String(month));
    const filePath = path.join(dirPath, `${event.eventId}.json`);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(event, null, 2), 'utf8');

    res.json({ success: true, event });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, message: 'Error creating event' });
  }
});

// Endpoint to get the most recent event added by the current user
app.get('/api/my-most-recent-event', requireLogin, async (req, res) => {
  try {
    const userID = req.session.user.userID;
    const event = await api.getMostRecentEventByUser(userID);
    res.json({ success: true, event });
  } catch (err) {
    console.error('Error fetching most recent event:', err);
    res.status(500).json({ success: false, message: 'Error fetching most recent event' });
  }
});

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
}

// Serve event form only to logged in users from private directory
app.get('/eventForm', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'eventForm.html'));
});

// Serve user profile form only to logged in users from private directory
app.get('/userProfileForm', /*requireLogin,*/ (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'userProfileForm.html'));
});

// Fallback to index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



let serverInstance;
function startServer(port = PORT) {
  if (!serverInstance) {
    serverInstance = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
  return serverInstance;
}

function closeServer(done) {
  if (serverInstance) {
    console.log('Closing server...');
    // Close the server and reset the instance
    serverInstance.close(err => {
      serverInstance = null;
      if (done) done(err);
    });
    console.log('Server closed');
  } else if (done) {
    done();
  }
}


if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, closeServer };
