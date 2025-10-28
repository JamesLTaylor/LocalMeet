// javascript API class to connect to local files
// const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const argon2 = require('argon2');
const { User, UserType } = require('./User');
const Event = require('./Event');
const { haversine } = require('./utils');
const CategoryTag = require('./CategoryTag');

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
      throw new Error('User instance with name required');
    }
    const usersDir = path.join(this.csvDir, './users');
    const filename = `${user.username.toLowerCase()}.json`;
    const filePath = path.join(usersDir, filename);
    // Serialize user object (remove circular refs if any)
    const userObj = typeof user.toJSON === 'function' ? user.toJSON() : user;
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(userObj, null, 2), 'utf8', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Append a new user row to _user_lookup.csv and return the new userID.
   * Validates username and password before appending.
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
      throw new Error(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      );
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
    const row = [nextId, username, salt, `"${String(passwordHash).replace(/"/g, '""')}"`, filename].join(',') + '\n';
    // Append to file and return userID
    return new Promise((resolve, reject) => {
      fs.appendFile(filePath, row, 'utf8', (err) => {
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
        const user = await this.getUserCredentialsByName(username);
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

  async getUserCredentialsByName(username) {
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
              filename: row.filename,
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
  async getUserCredentialsById(userID) {
    const filePath = path.join(this.csvDir, './users/_user_lookup.csv');
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.UserID && String(row.UserID) === String(userID)) {
            resolve({
              userID: row.UserID,
              username: row.username,
              filename: row.filename,
            });
          }
        })
        .on('end', () => resolve(null))
        .on('error', reject);
    });
  }

  /**
   * Get an instance of the user class given the filename for the user.
   * @param {string} filename
   * @returns {Promise<Object|null>}
   */
  async getUserDetailsByFilename(filename) {
    const filePath = path.join(this.csvDir, './users', filename);
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve(null);
          } else {
            reject(err);
          }
          return;
        }
        try {
          const userObj = JSON.parse(data);
          const user = new User(userObj);
          resolve(user);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async getMostRecentEventByUser(user) {
    if (!user || !user.username) {
      throw new Error('User instance with username required');
    }
    if (!user.eventFilesCreated || !Array.isArray(user.eventFilesCreated) || user.eventFilesCreated.length === 0) {
      return Event.example();
    }
    const lastEventFile = user.eventFilesCreated[user.eventFilesCreated.length - 1];
    if (!lastEventFile) {
      return Event.example();
    }
    try {
      const event = await this.getEventDetailsByFilename(lastEventFile);
      return event;
    } catch (err) {
      // if the event is not found then delete it from the user's eventFilesCreated
      const index = user.eventFilesCreated.indexOf(lastEventFile);
      if (index !== -1) {
        user.eventFilesCreated.splice(index, 1);
      }
      // save updated user to file
      await this.saveUserToFile(user);
      console.error(`Error fetching most recent event (${lastEventFile}), removed from user and trying again:`, err);
      return this.getMostRecentEventByUser(user);
    }
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
   * @param {User} user - The User instance who created the event (for ownership)
   * @returns {Promise<void>}
   */
  async writeEventToFile(event, user) {
    if (!event || !event.title || event.title.length < 5) {
      throw new Error('Event must have a valid title');
    }
    if (!user || !user.username) {
      throw new Error('Current username is not known');
    }
    // ensure the event has a date
    if (!event.date || !(event.date instanceof Date)) {
      throw new Error('Event must have a valid date');
    }

    const eventsDir = path.join(this.csvDir, './events');
    const eventDate = new Date(event.date);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const filename = `${day}_${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    const relativePath = path.join(year.toString(), month, filename);
    const filePath = path.join(eventsDir, relativePath);
    // if the new filePath already exists throw an error and the oldFilePath is different from the current filePath
    if (fs.existsSync(filePath) && event.originalFilePath !== relativePath) {
      throw new Error('An event with this title and date already exists');
    }

    // Check if the originalFilePath is set, if not set it to the current filePath
    if (!event.originalFilePath || event.originalFilePath === '') {
      event.originalFilePath = relativePath; // Store relative path for the event
    } else if (event.originalFilePath !== filePath) {
      // delete the old file if it exists
      const oldFilePath = path.join(eventsDir, event.originalFilePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log(`Deleted old event file: ${oldFilePath}`);
      }
      // remove this file from the user's eventFilesCreated
      const index = user.eventFilesCreated.indexOf(event.originalFilePath);
      if (index !== -1) {
        user.eventFilesCreated.splice(index, 1);
      }
      console.log(`Removed from user: ${event.originalFilePath}`);
    }
    if (!user.eventFilesCreated || !Array.isArray(user.eventFilesCreated)) {
      user.eventFilesCreated = [];
    }
    // Check if the user already has this event file
    if (!user.eventFilesCreated.includes(relativePath)) {
      console.log(`updating user with new event file: ${relativePath}`);
      user.eventFilesCreated.push(relativePath); // Track created files for the user
    }
    // if the relativePath is already in the user's eventFilesCreated then ensure it is the last entry in the array
    else {
      const index = user.eventFilesCreated.indexOf(relativePath);
      user.eventFilesCreated.splice(index, 1);
      user.eventFilesCreated.push(relativePath);
    }
    await this.writeUserJson(user);
    event.originalFilePath = relativePath;
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    // Serialize event object (remove circular refs if any)
    const eventObj = typeof event.toJSON === 'function' ? event.toJSON() : event;
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(eventObj, null, 2), 'utf8', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Get event details by filename
  async getEventDetailsByFilename(filename) {
    const filePath = path.join(this.csvDir, './events', filename);
    if (!fs.existsSync(filePath)) {
      throw new Error('Event not found');
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return new Event(JSON.parse(data));
  }

  /**
   * Get a list of events filtered by date range and location.
   * @param {Object} [options] - Options object
   * @param {Date|string} [options.startDate] - Start date (inclusive)
   * @param {Date|string} [options.endDate] - End date (inclusive)
   * @param {{ latitude: number, longitude: number }} [options.location] - Center location
   * @param {number} [options.distance] - Max distance in kilometers
   * @returns {Promise<Event[]>}
   */
  async getEvents({ startDate, endDate, location, distance } = {}) {
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
    let year = currentYear;
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
        const files = fs.readdirSync(monthDir).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          const filePath = path.join(monthDir, file);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // Optionally filter by location/distance
            let include = true;
            if (location && distance && data.location && typeof data.location === 'object') {
              const d = haversine(
                Number(data.location.latitude),
                Number(data.location.longitude),
                location.latitude,
                location.longitude
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
    return this.getTags('./tags/categoryTags.csv');
  }

  /**
   * Get a list of group tags from groupTags.csv
   * @returns {Promise<CategoryTag[]>}
   */
  async getGroupTags() {
    return this.getTags('./tags/groupTags.csv');
  }

  /**
   * Get a list of tags from a CSV file
   * @param {string} tagPath - Path to the CSV file
   * @returns {Promise<CategoryTag[]>}
   */
  async getTags(tagPath) {
    const fullPath = path.join(this.csvDir, tagPath);
    const tags = [];
    return new Promise((resolve, reject) => {
      try {
        fs.accessSync(fullPath, fs.constants.R_OK);
      } catch (err) {
        return reject(new Error(`${fullPath} not found or not readable`));
      }
      fs.createReadStream(fullPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name) {
            tags.push(
              new CategoryTag({
                name: row.name,
                description: row.description || '',
              })
            );
          }
        })
        .on('end', () => resolve(tags))
        .on('error', reject);
    });
  }
}

module.exports = Api;
