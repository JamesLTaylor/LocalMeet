const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const Api = require('../../model/Api');
const Event = require('../../model/Event');
const fs = require('fs');

describe('User Api', function() {
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
});

describe('Event file operations', function() {
  let api;
  before(function() {
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should create, save, load, and delete an event file', async function() {
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
      isDeleted: false
    });
    await api.writeEventToFile(event);
    // Get events for this month
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const events = await api.getEvents(startDate, endDate);
    const found = events.some(e => e.eventId === 'evt_test');
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

  before(function() {
    // Use test data directory if available
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should return false for a username that does not exist', async function() {
    const exists = await api.usernameExists('testUser');
    expect(exists).to.be.false;
  });


  it('should append a user to _user_lookup.csv', async function() {
    const userID = await api.appendUserToLookup(testUsername, testPassword);
    await api.getUserLookupById(userID).then(user => {
      expect(user.username).to.equal(testUsername);
      expect(user.filename).to.equal(`${testUsername.toLowerCase()}.json`);
    });
    const exists = await api.usernameExists('testUser');
    expect(exists).to.be.true;
  });
});


describe('Event Api', function() {
  let api;
  const fs = require('fs');
  before(function() {
    const csvDir = path.join(__dirname, '../test_data');
    api = new Api({ csvDir });
  });

  it('should write an event to a JSON file', async function() {
    const testEvent = new Event({
      eventId: 'evt1',
      date: '2025-07-25',
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
      isDeleted: false
    });
    await api.writeEventToFile(testEvent);
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
