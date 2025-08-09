const { Location } = require('./User');

const EventSize = Object.freeze({
  TINY: '5-10',
  SMALL: '10-20',
  MEDIUM: '20-50',
  LARGE: '50-100',
  HUGE: '100+',
});

const ContactVisibility = Object.freeze({
  NOBODY: 'NOBODY',
  LOCAL_MEET_DIRECT: 'LOCAL_MEET_DIRECT',
  LOGGED_IN: 'LOGGED_IN',
  PUBLIC: 'PUBLIC',
});

const Duration = Object.freeze({
  ONE_HOUR_OR_LESS: '1h_or_less',
  ONE_TO_TWO: '1_to_2',
  TWO_TO_THREE: '2_to_3',
  THREE_TO_FOUR: '3_to_4',
  MORE_THAN_FOUR: 'more_than_4',
});

class Event {
  /**
   * Create and return an example Event instance
   * @returns {Event}
   */
  static example() {
    return new Event({
      eventId: 'evt_example',
      title: 'Example Event',
      description: 'This is an example event.',
      date: new Date('2025-07-25T18:00:00Z'),
      duration: Duration.ONE_HOUR_OR_LESS,
      locationAddress: '123 Example St',
      locationPostcode: 'SG12 0DE',
      location: new Location(51.811892, -0.03717),
      memberOnly: false,
      externalRegister: '',
      localMeetRegister: true,
      groupTags: ['exampleGroup'],
      categoryTags: ['exampleCategory'],
      contactPerson: 'Jane Doe',
      contactDetails: 'jane@example.com',
      contactVisibility: ContactVisibility.LOGGED_IN,
      costIntroductory: 0,
      costRegular: 0,
      size: EventSize.SMALL,
      addedBy: 'user1',
      addedAt: Date.now(),
      lastEdited: Date.now(),
      registeredUsers: [1],
      interestedUsers: [2],
      isCancelled: false,
      isDeleted: false,
    });
  }
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
   * @param {string} [options.addedBy]
   * @param {Date} [options.addedAt]
   * @param {Date} [options.lastEdited]
   * @param {string[]} [options.registeredUsers]
   * @param {string[]} [options.interestedUsers]
   * @param {boolean} [options.isCancelled]
   * @param {boolean} [options.isDeleted]
   * @param {string} [options.originalFilePath] // Original filename for event data source
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
    originalFilePath = null,
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
    this.originalFilePath = originalFilePath;
  }

  /**
   * Create an Event from a plain object/dictionary
   * @param {Object} dict
   * @returns {Event}
   */
  static fromDict(dict) {
    return new Event({
      eventId: dict.eventId,
      title: dict.title,
      description: dict.description,
      date: dict.date ? new Date(dict.date) : undefined,
      duration: dict.duration || Duration.ONE_HOUR_OR_LESS,
      locationAddress: dict.locationAddress || '',
      locationPostcode: dict.locationPostcode || '',
      location:
        dict.location && typeof dict.location === 'string' && dict.location.includes(',')
          ? new Location(...dict.location.split(',').map(Number))
          : dict.location,
      memberOnly: dict.memberOnly === 'true' || dict.memberOnly === true,
      externalRegister: dict.externalRegister || '',
      localMeetRegister: dict.localMeetRegister === 'true' || dict.localMeetRegister === true,
      groupTags: Array.isArray(dict.groupTags)
        ? dict.groupTags
        : dict.groupTags
        ? String(dict.groupTags).split(';')
        : [],
      categoryTags: Array.isArray(dict.categoryTags)
        ? dict.categoryTags
        : dict.categoryTags
        ? String(dict.categoryTags).split(';')
        : [],
      contactPerson: dict.contactPerson || '',
      contactDetails: dict.contactDetails || '',
      contactVisibility: dict.contactVisibility || ContactVisibility.NOBODY,
      costIntroductory: Number(dict.costIntroductory) || 0,
      costRegular: Number(dict.costRegular) || 0,
      size: dict.size || EventSize.SMALL,
      directContact: dict.directContact === 'true' || dict.directContact === true,
      addedBy: dict.addedBy || null,
      addedAt: dict.addedAt ? new Date(dict.addedAt) : null,
      lastEdited: dict.lastEdited ? new Date(dict.lastEdited) : null,
      registeredUsers: Array.isArray(dict.registeredUsers)
        ? dict.registeredUsers
        : dict.registeredUsers
        ? String(dict.registeredUsers).split(';')
        : [],
      interestedUsers: Array.isArray(dict.interestedUsers)
        ? dict.interestedUsers
        : dict.interestedUsers
        ? String(dict.interestedUsers).split(';')
        : [],
      isCancelled: dict.isCancelled === 'true' || dict.isCancelled === true,
      isDeleted: dict.isDeleted === 'true' || dict.isDeleted === true,
      originalFilename: dict.originalFilename || null,
    });
  }
}

module.exports = Event;
module.exports.EventSize = EventSize;
module.exports.ContactVisibility = ContactVisibility;
module.exports.Duration = Duration;
