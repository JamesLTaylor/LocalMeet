const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const Api = require('../../model/Api');

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

const Event = require('../../model/Event');

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
