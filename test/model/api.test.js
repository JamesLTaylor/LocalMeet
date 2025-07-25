const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const Api = require('../../model/Api');

describe('Api', function() {
  let api;
  const testUsername = 'TestUser';
  const testPassword = 'TestPass123!';

  const fs = require('fs');
  const testDataDir = path.join(__dirname, '../test_data/users');
  const refFile = path.join(testDataDir, 'reference_user_lookup.csv');
  const targetFile = path.join(testDataDir, '_user_lookup.csv');

  beforeEach(function() {
    // Copy reference_user_lookup.csv to _user_lookup.csv before each test
    fs.copyFileSync(refFile, targetFile);
  });

  before(function() {
    // Use test data directory if available
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });



  it('should append a user to _user_lookup.csv', async function() {
    await api.appendUserToLookup(testUsername, testPassword);
    await api.getUserLookupById(2).then(user => {
      expect(user.username).to.equal(testUsername);
      expect(user.filename).to.equal(`${testUsername.toLowerCase()}.json`);
    });    
  });
  
  it('should return false for a username that does not exist', async function() {
    const exists = await api.usernameExists('testUser');
    expect(exists).to.be.false;
  });
});
