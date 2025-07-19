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

});
