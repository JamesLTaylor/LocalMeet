class Event {
  /**
   * @param {Object} options
   * @param {string} options.eventId
   * @param {Date} options.date
   * @param {string} options.title
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
   */
  constructor({
    eventId,
    date,
    title,
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
    interestedUsers = []
  }) {
    this.eventId = eventId;
    this.date = date;
    this.title = title;
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
  }
}

module.exports = Event;
