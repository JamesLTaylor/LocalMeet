const { expect } = require('chai');
const { User, Location } = require('../User');

describe('User', () => {
  it('should create a user with name, location, and preferred tags', () => {
    const loc = new Location(51.5, -0.1);
    const user = new User('Alice', loc, ['music', 'sports']);
    expect(user.name).to.equal('Alice');
    expect(user.location).to.deep.equal(loc);
    expect(user.preferredTags).to.deep.equal(['music', 'sports']);
  });
});

describe('Location', () => {
  it('should store latitude and longitude', () => {
    const loc = new Location(40.7, -74.0);
    expect(loc.latitude).to.equal(40.7);
    expect(loc.longitude).to.equal(-74.0);
  });
});
