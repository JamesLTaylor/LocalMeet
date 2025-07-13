const { Location } = require('./User');

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

const Duration = Object.freeze({
  ONE_HOUR_OR_LESS: '1h_or_less',
  ONE_TO_TWO: '1_to_2',
  TWO_TO_THREE: '2_to_3',
  THREE_TO_FOUR: '3_to_4',
  MORE_THAN_FOUR: 'more_than_4'
});

class Event {
  /**
   * @param {Object} options
   * @param {string} options.eventId
   * @param {string} options.title
   * @param {string} [options.description]
   * @param {Date} options.date
   * @param {string} [options.duration] // One of Duration
   * @param {string} [options.locationAddress]
   * @param {string} [options.locationPostcode]
   * @param {Location} options.location // Location object
   * @param {boolean} [options.memberOnly]
   * @param {string} [options.externalRegister]  // URL for external registration
   * @param {boolean} [options.localMeetRegister]
   * @param {string[]} [options.groupTags]
   * @param {string[]} [options.categoryTags]
   * @param {string} [options.contactPerson]
   * @param {string} [options.contactDetails]
   * @param {string} [options.contactVisibility] // One of ContactVisibility
   * @param {number} [options.costIntroductory]
   * @param {number} [options.costRegular]
   * @param {string} [options.size] // One of EventSize
   * @param {boolean} [options.directContact]
   * @param {string|null} [options.addedBy]
   * @param {Date|null} [options.addedAt]
   * @param {Date|null} [options.lastEdited]
   * @param {string[]} [options.registeredUsers]
   * @param {string[]} [options.interestedUsers]
   * @param {boolean} [options.isCancelled]
   * @param {boolean} [options.isDeleted]
   */
  constructor({
    eventId,
    title,
    description = '',
    date,
    duration = Duration.ONE_HOUR_OR_LESS,
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
    this.title = title;
    this.description = description;
    this.date = date;
    this.duration = duration;
    this.locationAddress = locationAddress;
    this.locationPostcode = locationPostcode;
    this.location = location;
    this.memberOnly = memberOnly;
    this.externalRegister = externalRegister;
    this.localMeetRegister = localMeetRegister;
    this.groupTags = groupTags;
    this.categoryTags = categoryTags;
    this.contactPerson = contactPerson;
    this.contactDetails = contactDetails;
    this.contactVisibility = contactVisibility;
    this.costIntroductory = costIntroductory;
    this.costRegular = costRegular;
    this.size = size;
    // System fields
    this.addedBy = addedBy;
    this.addedAt = addedAt;
    this.lastEdited = lastEdited;
    this.registeredUsers = registeredUsers;
    this.interestedUsers = interestedUsers;
    this.isCancelled = isCancelled;
    this.isDeleted = isDeleted;
  }
}

module.exports = Event;
module.exports.EventSize = EventSize;
module.exports.ContactVisibility = ContactVisibility;
module.exports.Duration = Duration;
