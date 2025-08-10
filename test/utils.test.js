const { expect } = require('chai');
const { Location, locationFromPostcode } = require('../model/utils');

// A test that ensures that locationFromPostcode returns the correct Location object
describe('locationFromPostcode', () => {
  it('should return the correct Location object for a valid postcode', () => {
    const location = locationFromPostcode('sg12 8Hu');

    expect(location).to.be.instanceOf(Location);
    expect(location.latitude).to.equal(51.789029);
    expect(location.longitude).to.equal(0.010051);
  });

  it('should return null for an invalid postcode', () => {
    const location = locationFromPostcode('INVALID');
    expect(location).to.be.null;
  });
});
