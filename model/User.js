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
   * @param {Object} options
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
    eventsAttended = []
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
  }
}

module.exports = { User, Location };
