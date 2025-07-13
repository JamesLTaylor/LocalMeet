// API class to connect to MySQL or local CSV files
// const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const argon2 = require('argon2');
const { User, Location, UserType } = require('./User');

class Api {
  /**
   * @param {Object} [options]
   * @param {Object} [options.mysqlConfig] - MySQL connection config
   * @param {string} [options.csvDir] - Directory for local CSV files
   */
  constructor(options = {}) {
    this.mysqlConfig = options.mysqlConfig;
    this.csvDir = options.csvDir;
    this.connection = null;
    if (this.mysqlConfig) {
      this.connection = mysql.createConnection(this.mysqlConfig);
    }
  }

  // Connect to MySQL
  connectMySQL() {
    if (!this.connection) throw new Error('No MySQL config provided');
    return new Promise((resolve, reject) => {
      this.connection.connect(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  // Query MySQL
  queryMySQL(sql, params = []) {
    if (!this.connection) throw new Error('No MySQL connection');
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
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
   * Create an event from a dictionary and write it to events.csv
   * @param {Object} eventData - Dictionary of event fields
   * @returns {Promise<Event>} - Resolves with the created Event instance
   */
  async createEvent(eventData) {
    const Event = require('./Event');
    // Create Event instance
    const event = new Event(eventData);
    // Prepare CSV row
    const row = {
      eventId: event.eventId,
      title: event.title,
      description: event.description,
      date: event.date,
      duration: event.duration,
      locationAddress: event.locationAddress,
      locationPostcode: event.locationPostcode,
      location: event.location instanceof Object && event.location.latitude !== undefined && event.location.longitude !== undefined
        ? `${event.location.latitude},${event.location.longitude}`
        : event.location,
      memberOnly: event.memberOnly,
      externalRegister: event.externalRegister,
      localMeetRegister: event.localMeetRegister,
      groupTags: Array.isArray(event.groupTags) ? event.groupTags.join(';') : event.groupTags,
      categoryTags: Array.isArray(event.categoryTags) ? event.categoryTags.join(';') : event.categoryTags,
      contactPerson: event.contactPerson,
      contactDetails: event.contactDetails,
      contactVisibility: event.contactVisibility,
      costIntroductory: event.costIntroductory,
      costRegular: event.costRegular,
      size: event.size,
      directContact: event.directContact,
      addedBy: event.addedBy,
      addedAt: event.addedAt,
      lastEdited: event.lastEdited,
      registeredUsers: Array.isArray(event.registeredUsers) ? event.registeredUsers.join(';') : event.registeredUsers,
      interestedUsers: Array.isArray(event.interestedUsers) ? event.interestedUsers.join(';') : event.interestedUsers,
      isCancelled: event.isCancelled,
      isDeleted: event.isDeleted
    };
    // Write to CSV
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.csvDir, 'events.csv');
      const headers = Object.keys(row);
      // Check if file exists and if header is present
      fs.stat(filePath, (err, stats) => {
        const writeRow = () => {
          const line = headers.map(h => (row[h] !== undefined ? row[h] : '')).join(',') + '\n';
          fs.appendFile(filePath, line, (err) => {
            if (err) return reject(err);
            resolve(event);
          });
        };
        if (err || !stats || stats.size === 0) {
          // Write header first
          fs.appendFile(filePath, headers.join(',') + '\n', (err) => {
            if (err) return reject(err);
            writeRow();
          });
        } else {
          writeRow();
        }
      });
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
