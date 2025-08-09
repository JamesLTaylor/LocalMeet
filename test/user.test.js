const { expect } = require('chai');
const { User, UserType } = require('../model/User');
const { Location } = require('../model/utils');

describe('User', () => {
  it('should create a user with name, location, and preferred tags', () => {
    const loc = new Location(51.5, -0.1);
    const user = new User({
      userID: 'user1',
      name: 'Alice',
      location: loc,
      searchCategoryTags: ['music', 'sports'],
    });
    expect(user.name).to.equal('Alice');
    expect(user.location).to.deep.equal(loc);
    expect(user.searchCategoryTags).to.deep.equal(['music', 'sports']);
  });
});

describe('Location', () => {
  it('should store latitude and longitude', () => {
    const loc = new Location(40.7, -74.0);
    expect(loc.latitude).to.equal(40.7);
    expect(loc.longitude).to.equal(-74.0);
  });
});

// Test that we can get an example event from the static method
describe('Event', () => {
  const Event = require('../model/Event');
  it('should return an example event with default values', () => {
    const event = Event.example();
    expect(event).to.have.property('eventId', 'evt_example');
    expect(event).to.have.property('title', 'Example Event');
    expect(event).to.have.property('description', 'This is an example event.');
    expect(event).to.have.property('date').that.is.a('date');
  });
});
