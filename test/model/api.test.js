const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const Api = require('../../model/Api');
const Event = require('../../model/Event');
const { User, UserType } = require('../../model/User');
const fs = require('fs');
const { resetUserLookupCsv } = require('../testUtils');

// A function to create a an instance of a user for testing
function createTestUser() {
  return new User({
    userID: 'test_user_id',
    username: 'username',
    email: 'test@example.com',
    password: 'password',
    userType: UserType.REGULAR,
    firstName: 'Test',
    lastName: 'User',
    location: { latitude: 51.5, longitude: -0.1 },
  });
}

describe('Logging in user API', function () {
  let api;
  const testUsername = 'TestUser';
  const testPassword = 'TestPass123!';

  beforeEach(function () {
    resetUserLookupCsv();
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should fail to log in as TestUser before user is created', async function () {
    try {
      await api.tryLogin(testUsername, testPassword);
      throw new Error('Login should have failed but succeeded');
    } catch (err) {
      expect(err.message).to.match(/not found|invalid/i);
    }
  });

  it('should return false for a username that does not exist', async function () {
    const exists = await api.usernameExists('testUser');
    expect(exists).to.be.false;
  });

  it('should append a user to _user_lookup.csv and be able to log in as that user', async function () {
    const userID = await api.appendUserToLookup(testUsername, testPassword);
    await api.getUserCredentialsById(userID).then((user) => {
      expect(user.username).to.equal(testUsername);
      expect(user.filename).to.equal(`${testUsername.toLowerCase()}.json`);
    });
    const exists = await api.usernameExists('testUser');
    expect(exists).to.be.true;
    const user = new User({
      userID: userID,
      username: testUsername,
      email: 'test@example.com',
      // other user properties
    });
    await api.writeUserJson(user);

    const loginUser = await api.tryLogin(testUsername, testPassword);
    expect(loginUser).to.have.property('userID');
    expect(loginUser).to.have.property('filename');

    await api.getUserDetailsByFilename(loginUser.filename).then((user) => {
      expect(user).to.not.be.null;
      expect(user.username).to.equal(testUsername);
    });
  });
});

describe('Event file operations', function () {
  let api;
  before(function () {
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should create, save, load, and delete an event file', async function () {
    // Create event for current month
    const now = new Date(2025, 6, 25); // July 25, 2025
    const event = new Event({
      eventId: 'evt_test',
      title: 'Test Event',
      date: now,
      location: { latitude: 51.5, longitude: -0.1 },
      groupTags: ['test'],
      categoryTags: ['test'],
      description: 'Test event file',
      contactPerson: 'Test',
      contactDetails: 'test@example.com',
      memberOnly: false,
      localMeetRegister: true,
      isCancelled: false,
      isDeleted: false,
    });
    const testUser = createTestUser();
    await api.writeEventToFile(event, testUser);
    // Get events for this month
    const query = {
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 7, 31),
    };
    const events = await api.getEvents(query);
    const found = events.some((e) => e.eventId === 'evt_test');
    expect(found).to.be.true;
    // Delete the event file
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const filename = `${day}_test_event.json`;
    const filePath = path.join(api.csvDir, 'events', year.toString(), month, filename);
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }
  });
});

// Test for writing an event to a JSON file
describe('Event Api', function () {
  let api;
  const fs = require('fs');
  before(function () {
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should write an event to a JSON file', async function () {
    const testEvent = new Event({
      eventId: 'evt1',
      date: new Date('2025-07-25T18:00:00Z'),
      title: 'Test Event',
      locationDescription: 'Test Location',
      location: 'Test Location',
      memberOnly: false,
      externalRegister: '',
      localMeetRegister: true,
      groupTags: ['group1'],
      categoryTags: ['cat1'],
      description: 'A test event',
      contactPerson: 'Test Person',
      contactDetails: 'test@example.com',
      directContact: false,
      cost: 0,
      registeredUsers: [],
      interestedUsers: [],
      expectedAttendees: 10,
      isCancelled: false,
      isDeleted: false,
    });
    testUser = createTestUser();
    await api.writeEventToFile(testEvent, testUser);
    // Check file exists
    const eventsDir = path.join(api.csvDir, 'events');
    const eventDate = new Date(testEvent.date);
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getDate()).padStart(2, '0');
    const filename = `${day}_test_event.json`;
    const filePath = path.join(eventsDir, year.toString(), month, filename);
    expect(fs.existsSync(filePath)).to.be.true;
    // Optionally, clean up
    // fs.unlinkSync(filePath);
  });
});

// Tests for category and group tags
describe('Category and Group Tags', function () {
  let api;
  before(function () {
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  // Test for getting a list of category tags
  it('should return a list of category tags', async function () {
    const categoryTags = await api.getCategoryTags();
    expect(categoryTags).to.be.an('array');
    // Collect the names of the tags into a new array
    const tagNames = categoryTags.map((tag) => tag.name);
    expect(tagNames).to.include('Gaming'); // Assuming 'Gaming' is a tag in the test data
  });

  // Test for getting a list of group tags
  it('should return a list of group tags', async function () {
    const groupTags = await api.getGroupTags();
    expect(groupTags).to.be.an('array');
    // Collect the names of the tags into a new array
    const tagNames = groupTags.map((tag) => tag.name);
    expect(tagNames).to.include('Everyone'); // Assuming 'Everyone' is a tag in the test data
  });
});

// Test that writing an event with no date or title throws an error
describe('Event Validation', function () {
  let api;
  before(function () {
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should throw an error when trying to write an event with no date or title', async function () {
    const invalidEvent = new Event({
      eventId: 'invalid_event',
      date: null, // No date
      title: null, // No title
    });
    try {
      const testUser = createTestUser();
      await api.writeEventToFile(invalidEvent, testUser);
      throw new Error('Expected error not thrown');
    } catch (err) {
      expect(err.message).to.include('Event must have a valid title');
    }
  });
});
