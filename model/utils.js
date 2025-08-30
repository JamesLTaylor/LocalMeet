const { postCodes, postCodeAreas } = require('../data/location/postCodes');

// Utility functions for WareToMeet
/**
 * Calculate the distance between two lat/lon points in kilometers using the Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { haversine };

/**
 * Location class for latitude/longitude
 * @class
 */
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
/**
 * Get location from postcode
 * @param {*} postcode
 * @returns {Location}
 */
function locationFromPostcode(postcode) {
  postcode = postcode.replace(/\s+/g, '').toUpperCase();
  if (postcode.length !== 7) {
    throw new Error('Incorrect postcode format');
  }
  const key = postcode.slice(0, 4) + ' ' + postcode.slice(4);
  coordinates = postCodes[key];
  if (!coordinates) {
    throw new Error('Postcode not found, please enter a valid postcode in one of ' + postCodeAreas.join(', '));
  }
  return new Location(coordinates[0], coordinates[1]);
}

module.exports = { Location, locationFromPostcode };
