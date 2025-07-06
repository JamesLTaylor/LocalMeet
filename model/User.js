const UserType = Object.freeze({
  MEMBER: 'member',
  ORGANIZER: 'organizer',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
});

class Location {
  /**
   * @param {number} latitude
   * @param {number} longitude
   */
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

class User {
  /**
   * A user can be:
   *  * a member
   *  * an organizer
   *  * a moderator
   *  * an admin
   *  
   *  * @param {Object} options
   * @param {string} options.userId
   * @param {string} options.name
   * @param {string} options.email
   * @param {string} options.salt
   * @param {string} options.password
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
   */
  constructor({
    userId,
    name,
    email,
    salt,
    password,
    dateJoined,
    location,
    searchGroupTags = [],
    searchCategoryTags = [],
    daysTimesOfInterest = [],
    eventsReviewed = [],
    eventsRegisteredInterest = [],
    eventsSignedUpFor = [],
    eventsAttended = [],
    userType = UserType.MEMBER
  }) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.salt = salt;
    this.password = password;
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
  }
}

module.exports = { User, Location, UserType };
