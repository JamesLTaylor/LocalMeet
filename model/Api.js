// API class to connect to MySQL or local CSV files
// const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const argon2 = require('argon2');
const { User, Location, UserType } = require('./User');
const Event = require('./Event');

class Api {

  /**
   * Get userID, username, and filename for a given userID from _user_lookup.csv
   * @param {string|number} userId
   * @returns {Promise<{userID: string, username: string, filename: string} | null>}
   */
  async getUserLookupById(userId) {
    const filePath = path.join(this.csvDir, './users/_user_lookup.csv');
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.UserID && String(row.UserID) === String(userId)) {
            resolve({
              userID: row.UserID,
              username: row.username,
              filename: row.filename
            });
          }
        })
        .on('end', () => resolve(null))
        .on('error', reject);
    });
  }

  /**
   * Append a new user row to _user_lookup.csv
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  async appendUserToLookup(username, password) {
    const filePath = path.join(this.csvDir, './users/_user_lookup.csv');
    // Generate salt and hash
    const crypto = require('crypto');
    const salt = crypto.randomBytes(8).toString('base64');
    const argon2 = require('argon2');
    const passwordHash = await argon2.hash(password + salt);

    // Find next UserID
    let nextId = 1;
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8').split('\n');
      if (data.length > 1) {
        const lastLine = data.filter(line => line.trim()).slice(-1)[0];
        if (lastLine) {
          const lastId = parseInt(lastLine.split(',')[0], 10);
          if (!isNaN(lastId)) nextId = lastId + 1;
        }
      }
    }

    // Compose row
    const filename = `${username.toLowerCase()}.json`;
    // Write userID as int (no quotes), rest as quoted CSV
    const row = [nextId, username, salt, passwordHash, filename]
      .map((val, idx) => idx === 0 ? String(val) : `"${String(val).replace(/"/g, '""')}"`)
      .join(',') + '\n';
    // Append to file
    return new Promise((resolve, reject) => {
      fs.appendFile(filePath, row, 'utf8', err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }



  /**
   * @param {Object} [options]
   * @param {string} [options.csvDir] - Directory for local CSV files
   */
  constructor(options = {}) {
    this.csvDir = options.csvDir;
  }

  // Read from a CSV file
  readCSV(filename) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(path.join(this.csvDir, filename))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Iterate over each row in a CSV file and call a callback for each row.
   * @param {string} filename - The CSV file name (relative to csvDir)
   * @param {(row: object) => void} onRow - Callback for each row
   * @param {() => void} [onEnd] - Optional callback when done
   * @param {(err: Error) => void} [onError] - Optional callback for errors
   */
  forEachCSVRow(filename, onRow, onEnd, onError) {
    fs.createReadStream(path.join(this.csvDir, filename))
      .pipe(csv())
      .on('data', onRow)
      .on('end', () => { if (onEnd) onEnd(); })
      .on('error', err => { if (onError) onError(err); });
  }

  /**
   * Check if a username exists in _user_lookup.csv
   * @param {string} username
   * @returns {Promise<boolean>} Resolves with true if username exists, false otherwise
   */
  async usernameExists(username) {
    return new Promise((resolve, reject) => {
      let found = false;
      fs.createReadStream(path.join(this.csvDir, './users/_user_lookup.csv'))
        .pipe(csv())
        .on('data', (row) => {
          if (!found && row.username && row.username.toLowerCase() === username.toLowerCase()) {
            found = true;
            resolve(true);
            this.destroy && this.destroy(); // End stream early if possible
          }
        })
        .on('end', () => {
          if (!found) resolve(false);
        })
        .on('error', reject);
    });
  }



  /**
   * Get a user by email and password from users.csv
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object|null>} Resolves with user object or null if not found
   */
  async getUserByEmail(email, password) {
    const emailLower = email.toLowerCase();
    return new Promise((resolve, reject) => {
      let resolved = false;
      const stream = fs.createReadStream(path.join(this.csvDir, 'users.csv'))
        .pipe(csv())
        .on('data', (row) => {
          if (resolved) return; // Prevent multiple resolves
          if (row.email && row.email === emailLower) {
            // Pause the stream while we verify
            stream.pause();
            console.log('Checking user:', row.email);
            // argon2.hash(password + row.salt)
            // .then((hash) => {
            //   console.log(hash);})
            argon2.verify(row.password, password + row.salt)
              .then((match) => {
                if (match && !resolved) {
                  resolved = true;
                const user = new User({
                  userId: row.userId,
                  name: row.name,
                  email: row.email,
                  salt: row.salt,
                  password: row.password,
                  dateJoined: row.dateJoined,
                  location: new Location(Number(row.latitude), Number(row.longitude)),
                  searchGroupTags: row.searchGroupTags ? row.searchGroupTags.split(';') : [],
                  searchCategoryTags: row.searchCategoryTags ? row.searchCategoryTags.split(';') : [],
                  daysTimesOfInterest: row.daysTimesOfInterest ? row.daysTimesOfInterest.split(';') : [],
                  eventsReviewed: row.eventsReviewed ? row.eventsReviewed.split(';') : [],
                  eventsRegisteredInterest: row.eventsRegisteredInterest ? row.eventsRegisteredInterest.split(';') : [],
                  eventsSignedUpFor: row.eventsSignedUpFor ? row.eventsSignedUpFor.split(';') : [],
                  eventsAttended: row.eventsAttended ? row.eventsAttended.split(';') : [],
                  userType: row.userType
                });
                resolve(user);
                stream.destroy();
              } else {
                stream.resume();
              }
            })
            .catch(err => {
              if (!resolved) {
                resolved = true;
                reject(err);
                stream.destroy();
              }
            });
          }
        })
        .on('end', () => {
          if (!resolved) resolve(null);
        })
        .on('error', err => {
          if (!resolved) reject(err);
        });
    });
  }

  /**
   * Get a list of events filtered by date range and location.
   * @param {Date|string} startDate - Start date (inclusive)
   * @param {Date|string} endDate - End date (inclusive)
   * @param {{ latitude: number, longitude: number }} [location] - Center location
   * @param {number} [distance] - Max distance in kilometers
   * @returns {Promise<Event[]>}
   */
  async getEvents({ startDate, endDate, location, distance }) {
    const Event = require('./Event');
    const events = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    return new Promise((resolve, reject) => {
      fs.createReadStream(path.join(this.csvDir, 'events.csv'))
        .pipe(csv())
        .on('data', (row) => {
          try {
            const eventDate = new Date(row.date);
            if (eventDate >= start && eventDate <= end) {
              let include = true;
              if (location && distance && row.latitude && row.longitude) {
                const d = haversine(
                  Number(row.latitude), Number(row.longitude),
                  location.latitude, location.longitude
                );
                if (d > distance) include = false;
              }
              if (include) {
                events.push(new Event({
                  eventId: row.eventId,
                  date: row.date,
                  title: row.title,
                  locationDescription: row.locationDescription,
                  location: row.location,
                  memberOnly: row.memberOnly === 'true' || row.memberOnly === true,
                  externalRegister: row.externalRegister,
                  localMeetRegister: row.localMeetRegister === 'true' || row.localMeetRegister === true,
                  groupTags: row.groupTags ? row.groupTags.split(';') : [],
                  categoryTags: row.categoryTags ? row.categoryTags.split(';') : [],
                  description: row.description,
                  contactPerson: row.contactPerson,
                  contactDetails: row.contactDetails,
                  directContact: row.directContact === 'true' || row.directContact === true,
                  cost: Number(row.cost) || 0,
                  registeredUsers: row.registeredUsers ? row.registeredUsers.split(';') : [],
                  interestedUsers: row.interestedUsers ? row.interestedUsers.split(';') : [],
                  expectedAttendees: Number(row.expectedAttendees) || 0,
                  isCancelled: row.isCancelled === 'true' || row.isCancelled === true,
                  isDeleted: row.isDeleted === 'true' || row.isDeleted === true
                }));
              }
            }
          } catch (err) {
            // skip invalid row
          }
        })
        .on('end', () => resolve(events))
        .on('error', reject);
    });
  }

  /**
   * Get a list of CategoryTags from categoryTags.csv
   * @returns {Promise<CategoryTag[]>}
   */
  async getCategoryTags() {
    const CategoryTag = require('./CategoryTag');
    const tags = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(path.join(this.csvDir, 'categoryTags.csv'))
        .pipe(csv())
        .on('data', (row) => {
          if (row.name) {
            tags.push(new CategoryTag({
              name: row.name,
              description: row.description || ''
            }));
          }
        })
        .on('end', () => resolve(tags))
        .on('error', reject);
    });
  }



  /**
   * Get the most recent event added by a user
   * @param {string} userId - The userId of the user
   * @returns {Promise<Event|null>} - Resolves with the most recent Event or null
   */
  async getMostRecentEventByUser(userId) {
    const Event = require('./Event');
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.csvDir, 'events.csv');
      const events = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.addedBy && row.addedBy === userId) {
            events.push(new Event(row));
          }
        })
        .on('end', () => {
          if (events.length === 0) return resolve(null);
          // Sort by eventId descending
          events.sort((a, b) => new Date(b.eventId) - new Date(a.eventId));
          resolve(events[0]);
        })
        .on('error', reject);
    });
  }
}

module.exports = Api;
