// API class to connect to MySQL or local CSV files
// const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const argon2 = require('argon2');
const { User, Location, UserType } = require('./User');
const Event = require('./Event');
const { haversine } = require('./utils');

class Api {
  /**
   * @param {Object} [options]
   * @param {string} [options.csvDir] - Directory for local CSV files
   */
  constructor(options = {}) {
    this.csvDir = options.csvDir;
  }

  /**
   * Write a user JSON file to the users folder given a User instance
   * @param {User} user - Instance of User
   * @returns {Promise<void>}
   */
  async writeUserJson(user) {
    if (!user || !user.username) {
      throw new Error('User instance with username required');
    }
    const usersDir = path.join(this.csvDir, './users');
    const filename = `${user.username.toLowerCase()}.json`;
    const filePath = path.join(usersDir, filename);
    // Serialize user object (remove circular refs if any)
    const userObj = typeof user.toJSON === 'function' ? user.toJSON() : user;
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(userObj, null, 2), 'utf8', err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Append a new user row to _user_lookup.csv
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  async appendUserToLookup(username, password) {
    // Validate username: only alphanumeric, no spaces
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      throw new Error('Username must be alphanumeric with no spaces');
    }
    // Validate password: at least 8 chars, mix of upper, lower, number, special
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }
    const filePath = path.join(this.csvDir, './users/_user_lookup.csv');
    // Check if username exists and find lastId in one pass
    let usernameExists = false;
    let lastId = 0;
    if (fs.existsSync(filePath)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            if (row.username && row.username.toLowerCase() === username.toLowerCase()) {
              usernameExists = true;
            }
            if (row.UserID && !isNaN(row.UserID)) {
              const id = parseInt(row.UserID, 10);
              if (id > lastId) lastId = id;
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }
    if (usernameExists) {
      throw new Error('Username already exists');
    }

    // Generate salt and hash
    const crypto = require('crypto');
    const salt = crypto.randomBytes(8).toString('base64');
    const argon2 = require('argon2');
    const passwordHash = await argon2.hash(password + salt);

    const nextId = lastId + 1;
    // Compose row
    const filename = `${username.toLowerCase()}.json`;
    // Only passwordHash is quoted, all other fields are unquoted
    const row = [
      nextId,
      username,
      salt,
      `"${String(passwordHash).replace(/"/g, '""')}"`,
      filename
    ].join(',') + '\n';
    // Append to file and return userID
    return new Promise((resolve, reject) => {
      fs.appendFile(filePath, row, 'utf8', err => {
        if (err) reject(err);
        else resolve(nextId);
      });
    });
  }

  /**
   * Try to login with username and password. Will raise an error is login fails.
   * Returns the user object if successful.
   * @param {string} username
   * @param {string} password
   */
  tryLogin(username, password) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!username || !password) {
          return reject(new Error('Username and password are required'));
        }
        const user = await this.getUserByUsername(username);
        if (!user) {
          return reject(new Error('User not found'));
        }
        const isValid = await argon2.verify(user.passwordHash, password + user.salt);
        if (!isValid) {
          return reject(new Error('Invalid password'));
        }
        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getUserByUsername(username) {
    if (!username) {
      throw new Error('Username is required');
    }
    const filePath = path.join(this.csvDir, './users/_user_lookup.csv');
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.username && row.username.toLowerCase() === username.toLowerCase()) {
            resolve({
              userID: row.UserID,
              username: row.username,
              passwordHash: row.passwordHash,
              salt: row.salt,
              filename: row.filename
            });
          }
        })
        .on('end', () => resolve(null))
        .on('error', reject);
    });
  }

  /**
   * Get userID, username, and filename for a given userID from _user_lookup.csv
   * @param {string|number} userID
   * @returns {Promise<{userID: string, username: string, filename: string} | null>}
   */
  async getUserLookupById(userID) {
    const filePath = path.join(this.csvDir, './users/_user_lookup.csv');
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.UserID && String(row.UserID) === String(userID)) {
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


  // EVENT METHODS
  /**
   * Write an Event instance to a JSON file. The will be saved in the format /data/events/{year}/{month}/{day}_{eventTitle}.json
   * @param {Event} event - The Event instance to write
   * @returns {Promise<void>}
   */
  async writeEventToFile(event) {
    if (!event || !event.title) {
      throw new Error('Event instance with title required');
    }
    const eventsDir = path.join(this.csvDir, './events');
    const eventDate = new Date(event.date);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const filename = `${day}_${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    const filePath = path.join(eventsDir, year.toString(), month, filename);
    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    // Serialize event object (remove circular refs if any)
    const eventObj = typeof event.toJSON === 'function' ? event.toJSON() : event;
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(eventObj, null, 2), 'utf8', err => {
        if (err) reject(err);
        else resolve();
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
  async getEvents({startDate, endDate, location, distance}={}) {
    const Event = require('./Event');
    const events = [];
    if (!startDate) {
      startDate = new Date();
    }
    if (!endDate) {
      endDate = startDate + 60 * 24 * 60 * 60 * 1000; // Default to 2 months ahead 
    }
    // get all months and years from startDate to endDate, inclusive.
    const currentYear = startDate.getFullYear();
    const currentMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const monthsToLoad = [];
    let year = currentYear
    let month = currentMonth;
    // Generate all months from start to end  
    while (year < endYear || (year === endYear && month <= endMonth)) {
      monthsToLoad.push({ year, month: String(month).padStart(2, '0') });
      month++;
      if (month > 12) {
        month = 1;
        year++;
      } 
    }
    const eventsDir = path.join(this.csvDir, 'events');
    for (const { year, month } of monthsToLoad) {
      const monthDir = path.join(eventsDir, year.toString(), month);
      if (fs.existsSync(monthDir)) {
        const files = fs.readdirSync(monthDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const filePath = path.join(monthDir, file);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // Optionally filter by location/distance
            let include = true;
            if (location && distance && data.location && typeof data.location === 'object') {
              const d = haversine(
                Number(data.location.latitude), Number(data.location.longitude),
                location.latitude, location.longitude
              );
              if (d > distance) include = false;
            }
            if (include) {
              events.push(new Event(data));
            }
          } catch (err) {
            // skip invalid file
          }
        }
      }
    }
    return events;
  }

  /**
   * Get a list of CategoryTags from categoryTags.csv
   * @returns {Promise<CategoryTag[]>}
   */
  async getCategoryTags() {
    const CategoryTag = require('./CategoryTag');
    const tags = [];
    return new Promise((resolve, reject) => {
      try {
        fs.accessSync(path.join(this.csvDir, 'categoryTags.csv'), fs.constants.R_OK);
      } catch (err) {
        return reject(new Error('categoryTags.csv not found or not readable'));
      } 
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
}

module.exports = Api;
