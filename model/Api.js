// API class to connect to MySQL or local CSV files
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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
}

module.exports = Api;
