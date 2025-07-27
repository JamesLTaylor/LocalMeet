
const { Location } = require('./utils');
const UserType = Object.freeze({
  MEMBER: 'member',
  ORGANIZER: 'organizer',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
});

class User {
  /**
   * A user can be:
   *  * a member
   *  * an organizer
   *  * a moderator
   *  * an admin
   *  
   *  * @param {Object} options
   * @param {string} options.userID
   * @param {string} options.username
   * @param {string} options.name
   * @param {string} options.email
   * @param {Date} options.dateJoined
   * @param {Location} options.location
   * @param {string[]} options.searchGroupTags
   * @param {string[]} options.searchCategoryTags
   * @param {string[]} options.daysTimesOfInterest
   * @param {string[]} options.eventsReviewed
   * @param {string[]} options.eventsRegisteredInterest
   * @param {string[]} options.eventsSignedUpFor
   * @param {string[]} options.eventsAttended
   * @param {string} options.userType - One of 'member', 'organizer', 'moderator', 'admin'
   * @param {string[]} options.eventFilesCreated - List of event JSON filenames the user has created
   * @param {string[]} options.eventFilesEdited - List of event JSON filenames the user has edited
   */
  constructor({
    userID,
    username,
    name,
    email,
    dateJoined,
    location,
    searchGroupTags = [],
    searchCategoryTags = [],
    daysTimesOfInterest = [],
    eventsReviewed = [],
    eventsRegisteredInterest = [],
    eventsSignedUpFor = [],
    eventsAttended = [],
    userType = UserType.MEMBER,
    eventFilesCreated = [],
    eventFilesEdited = []
  }) {
    this.userID = userID;
    this.username = username
    this.name = name;
    this.email = email;
    this.dateJoined = dateJoined;
    this.location = location;
    this.searchGroupTags = searchGroupTags;
    this.searchCategoryTags = searchCategoryTags;
    this.daysTimesOfInterest = daysTimesOfInterest;
    this.eventsReviewed = eventsReviewed;
    this.eventsRegisteredInterest = eventsRegisteredInterest;
    this.eventsSignedUpFor = eventsSignedUpFor;
    this.eventsAttended = eventsAttended;
    this.userType = userType;
    this.eventFilesCreated = eventFilesCreated;
    this.eventFilesEdited = eventFilesEdited;
  }
}

  /**
   * Converts a dictionary to a User object.
   * * @param {Object} dict - The dictionary to convert.
   * @returns {User} The User object. 
   * */
  fromDict = function(dict) {
    return new User({
      userID: dict.userID,
      username: dict.username,
      name: dict.name,
      email: dict.email,
      dateJoined: dict.dateJoined,
      location: new Location(dict.location.latitude, dict.location.longitude),
      searchGroupTags: dict.searchGroupTags,
      searchCategoryTags: dict.searchCategoryTags,
      daysTimesOfInterest: dict.daysTimesOfInterest,
      eventsReviewed: dict.eventsReviewed,
      eventsRegisteredInterest: dict.eventsRegisteredInterest,
      eventsSignedUpFor: dict.eventsSignedUpFor,
      eventsAttended: dict.eventsAttended,
      userType: dict.userType,
      eventFilesCreated: dict.eventFilesCreated,
      eventFilesEdited: dict.eventFilesEdited
    });
  }

  /** Add an edited event file to the user if it does not already exist */
  addEditedEventFile = (filename) => {
    if (!this.eventFilesEdited.includes(filename)) {
      this.eventFilesEdited.push(filename);
    }
  } 

module.exports = { User, UserType };
