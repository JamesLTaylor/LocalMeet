const fs = require('fs');
const path = require('path');

/**
 * Copy reference_user_lookup.csv to _user_lookup.csv in the test data directory
 */
function resetUserLookupCsv() {
  const testDataDir = path.join(__dirname, 'test_data/users');
  const refFile = path.join(testDataDir, 'reference_user_lookup.csv');
  const targetFile = path.join(testDataDir, '_user_lookup.csv');
  fs.copyFileSync(refFile, targetFile);
}

module.exports = { resetUserLookupCsv };
