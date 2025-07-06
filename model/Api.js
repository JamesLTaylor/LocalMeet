// API class to connect to MySQL or local CSV files
// const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { User, Location } = require('./User');

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
  getUserByEmail(email, password) {
    return new Promise((resolve, reject) => {
      const emailLower = email.toLowerCase();
      fs.createReadStream(path.join(this.csvDir, 'users.csv'))
        .pipe(csv())
        .on('data', (row) => {
          console.log('Checking user:', row.email); // Debug log
          if (row.email && row.email === emailLower && row.password === password) {
            // Convert CSV row to User instance
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
              eventsAttended: row.eventsAttended ? row.eventsAttended.split(';') : []
            });
            resolve(user);
          }
        })
        .on('end', () => {
          resolve(null);
        })
        .on('error', reject);
    });
  }
}

module.exports = Api;
