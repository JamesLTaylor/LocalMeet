const EventSize = Object.freeze({
  TINY: '5-10',
  SMALL: '10-20',
  MEDIUM: '20-50',
  LARGE: '50-100',
  HUGE: '100+'
});

class Event {
  /**
   * @param {Object} options
   * @param {string} options.eventId
   * @param {string} [options.addedBy] // UserId of the user who added this event
   * @param {Date} options.date
   * @param {string} options.title
   * @param {string} options.locationDescription // Description of the location
   * @param {string} options.location
   * @param {boolean} options.memberOnly
   * @param {string} [options.externalRegister] // Link/email to tickets
   * @param {boolean} [options.localMeetRegister]
   * @param {string[]} [options.groupTags]
   * @param {string[]} [options.categoryTags]
   * @param {string} options.description
   * @param {string} options.contactPerson
   * @param {string} options.contactDetails
   * @param {boolean} [options.directContact] // true = direct, false = via website
   * @param {number} [options.cost]
   * @param {string[]} [options.registeredUsers]
   * @param {string[]} [options.interestedUsers]
   * @param {boolean} [options.isCancelled] // Event is cancelled
   * @param {boolean} [options.isDeleted] // Event is deleted
   * @param {string} [options.size] // Event size, one of EventSize
   */
  constructor({
    eventId,
    addedBy = null,
    date,
    title,
    locationDescription = '',
    location,
    memberOnly = false,
    externalRegister = '',
    localMeetRegister = false,
    groupTags = [],
    categoryTags = [],
    description = '',
    contactPerson = '',
    contactDetails = '',
    directContact = false,
    cost = 0,
    registeredUsers = [],
    interestedUsers = [],
    isCancelled = false,
    isDeleted = false,
    size = EventSize.SMALL
  }) {
    this.eventId = eventId;
    this.addedBy = addedBy;
    this.date = date;
    this.title = title;
    this.locationDescription = locationDescription;
    this.location = location;
    this.memberOnly = memberOnly;
    this.externalRegister = externalRegister;
    this.localMeetRegister = localMeetRegister;
    this.groupTags = groupTags;
    this.categoryTags = categoryTags;
    this.description = description;
    this.contactPerson = contactPerson;
    this.contactDetails = contactDetails;
    this.directContact = directContact;
    this.cost = cost;
    this.registeredUsers = registeredUsers;
    this.interestedUsers = interestedUsers;
    this.isCancelled = isCancelled;
    this.isDeleted = isDeleted;
    this.size = size;
  }
}

module.exports = Event;
module.exports.EventSize = EventSize;
