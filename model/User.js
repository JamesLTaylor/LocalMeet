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
   * @param {string} name - The user's name
   * @param {Location} location - The user's location
   * @param {string[]} preferredTags - The user's preferred search tags
   */
  constructor(name, location, preferredTags = []) {
    this.name = name;
    this.location = location;
    this.preferredTags = preferredTags;
  }
}

module.exports = { User, Location };
