const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const Api = require('../../model/Api');

describe('Api', function() {
  let api;

  before(function() {
    // Use test data directory if available
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should be constructed without error', function() {
    expect(api).to.be.an('object');
  });

  it('should append a user to _user_lookup.csv', async function() {
    const fs = require('fs');
    const testUsername = 'TestUser';
    const testPassword = 'TestPass123!';
    await api.appendUserToLookup(testUsername, testPassword);
    await api.getUserLookupById(2).then(user => {
      expect(user.username).to.equal(testUsername);
      expect(user.filename).to.equal(`${testUsername.toLowerCase()}.json`);
    });
  });

});
