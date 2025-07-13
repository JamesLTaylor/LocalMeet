const EventSize = Object.freeze({
  TINY: '5-10',
  SMALL: '10-20',
  MEDIUM: '20-50',
  LARGE: '50-100',
  HUGE: '100+'
});

const ContactVisibility = Object.freeze({
  NOBODY: 'NOBODY',
  LOCAL_MEET_DIRECT: 'LOCAL_MEET_DIRECT',
  LOGGED_IN: 'LOGGED_IN',
  PUBLIC: 'PUBLIC'
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
   * @param {string} [options.contactVisibility] // One of ContactVisibility
   * @param {string} [options.duration] // e.g. '1h_or_less', '1_to_2', etc.
   * @param {number} [options.costIntroductory]
   * @param {number} [options.costRegular]
   * @param {boolean} [options.directContact] // true = direct, false = via website
   * @param {string[]} [options.registeredUsers]
   * @param {string[]} [options.interestedUsers]
   * @param {boolean} [options.isCancelled] // Event is cancelled
   * @param {boolean} [options.isDeleted] // Event is deleted
   * @param {string} [options.size] // Event size, one of EventSize
   */
  constructor({
    eventId,
    title,
    description = '',
    date,
    startTime = null,
    duration = '1h_or_less',
    locationAddress = '',
    locationPostcode = '',
    location,
    memberOnly = false,
    externalRegister = '',
    localMeetRegister = false,
    groupTags = [],
    categoryTags = [],
    contactPerson = '',
    contactDetails = '',
    contactVisibility = ContactVisibility.NOBODY,
    costIntroductory = 0,
    costRegular = 0,
    size = EventSize.SMALL,
    // System fields
    addedBy = null,
    addedAt = null,
    lastEdited = null,
    registeredUsers = [],
    interestedUsers = [],
    isCancelled = false,
    isDeleted = false,
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
    this.contactVisibility = contactVisibility;
    this.duration = duration;
    this.costIntroductory = costIntroductory;
    this.costRegular = costRegular;
    this.directContact = directContact;
    this.registeredUsers = registeredUsers;
    this.interestedUsers = interestedUsers;
    this.isCancelled = isCancelled;
    this.isDeleted = isDeleted;
    this.size = size;
    // System fields
  }
}

module.exports = Event;
module.exports.EventSize = EventSize;
module.exports.ContactVisibility = ContactVisibility;
