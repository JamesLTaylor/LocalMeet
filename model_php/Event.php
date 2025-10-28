<?php

require_once(__DIR__ . '/utils.php');

class Event {
    // Constants
    const EVENT_SIZE = [
        'TINY' => '5-10',
        'SMALL' => '10-20',
        'MEDIUM' => '20-50',
        'LARGE' => '50-100',
        'HUGE' => '100+'
    ];

    const CONTACT_VISIBILITY = [
        'NOBODY' => 'NOBODY',
        'LOCAL_MEET_DIRECT' => 'LOCAL_MEET_DIRECT',
        'LOGGED_IN' => 'LOGGED_IN',
        'PUBLIC' => 'PUBLIC'
    ];

    const DURATION = [
        'ONE_HOUR_OR_LESS' => '1h_or_less',
        'ONE_TO_TWO' => '1_to_2',
        'TWO_TO_THREE' => '2_to_3',
        'THREE_TO_FOUR' => '3_to_4',
        'MORE_THAN_FOUR' => 'more_than_4'
    ];

    // Properties
    public $eventId;
    public $title;
    public $description;
    public $date;
    public $duration;
    public $locationAddress;
    public $locationPostcode;
    public $location;
    public $memberOnly;
    public $externalRegister;
    public $localMeetRegister;
    public $groupTags;
    public $categoryTags;
    public $contactPerson;
    public $contactDetails;
    public $contactVisibility;
    public $costIntroductory;
    public $costRegular;
    public $size;
    public $addedBy;
    public $addedAt;
    public $lastEdited;
    public $registeredUsers;
    public $interestedUsers;
    public $isCancelled;
    public $isDeleted;
    public $originalFilePath;

    /**
     * Create and return an example Event instance
     * @return Event
     */
    public static function example() {
        // example date is 19:00, 3 weeks from now
        $exampleDate = new DateTime();
        $exampleDate->modify('+21 days');
        $exampleDate->setTime(19, 0);

        return new self([
            'eventId' => 'evt_example',
            'title' => 'Example Event',
            'description' => 'This is an example event.',
            'date' => $exampleDate,
            'duration' => self::DURATION['ONE_HOUR_OR_LESS'],
            'locationAddress' => '123 Example St',
            'locationPostcode' => 'SG12 0DE',
            'location' => new Location(51.811892, -0.03717),
            'memberOnly' => false,
            'externalRegister' => '',
            'localMeetRegister' => true,
            'groupTags' => ['exampleGroup'],
            'categoryTags' => ['exampleCategory'],
            'contactPerson' => 'Jane Doe',
            'contactDetails' => 'jane@example.com',
            'contactVisibility' => self::CONTACT_VISIBILITY['LOGGED_IN'],
            'costIntroductory' => 0,
            'costRegular' => 0,
            'size' => self::EVENT_SIZE['SMALL'],
            'addedBy' => 'user1',
            'addedAt' => time(),
            'lastEdited' => time(),
            'registeredUsers' => [1],
            'interestedUsers' => [2],
            'isCancelled' => false,
            'isDeleted' => false
        ]);
    }

    /**
     * @param array $options Array of event properties
     */
    public function __construct(array $options) {
        $this->eventId = $options['eventId'];
        $this->title = $options['title'];
        $this->description = $options['description'] ?? '';
        $this->date = $options['date'];
        $this->duration = $options['duration'] ?? self::DURATION['ONE_HOUR_OR_LESS'];
        $this->locationAddress = $options['locationAddress'] ?? '';
        $this->locationPostcode = $options['locationPostcode'] ?? '';
        $this->location = $options['location'];
        $this->memberOnly = $options['memberOnly'] ?? false;
        $this->externalRegister = $options['externalRegister'] ?? '';
        $this->localMeetRegister = $options['localMeetRegister'] ?? false;
        $this->groupTags = $options['groupTags'] ?? [];
        $this->categoryTags = $options['categoryTags'] ?? [];
        $this->contactPerson = $options['contactPerson'] ?? '';
        $this->contactDetails = $options['contactDetails'] ?? '';
        $this->contactVisibility = $options['contactVisibility'] ?? self::CONTACT_VISIBILITY['NOBODY'];
        $this->costIntroductory = $options['costIntroductory'] ?? 0;
        $this->costRegular = $options['costRegular'] ?? 0;
        $this->size = $options['size'] ?? self::EVENT_SIZE['SMALL'];
        $this->addedBy = $options['addedBy'] ?? null;
        $this->addedAt = $options['addedAt'] ?? null;
        $this->lastEdited = $options['lastEdited'] ?? null;
        $this->registeredUsers = $options['registeredUsers'] ?? [];
        $this->interestedUsers = $options['interestedUsers'] ?? [];
        $this->isCancelled = $options['isCancelled'] ?? false;
        $this->isDeleted = $options['isDeleted'] ?? false;
        $this->originalFilePath = $options['originalFilePath'] ?? null;
    }

    /**
     * Create an Event from a plain array/dictionary
     * @param array $dict
     * @return Event
     */
    public static function fromDict($dict) {
        $location = null;
        if (isset($dict['location'])) {
            if (is_string($dict['location']) && strpos($dict['location'], ',') !== false) {
                list($lat, $lon) = array_map('floatval', explode(',', $dict['location']));
                $location = new Location($lat, $lon);
            } else {
                $location = $dict['location'];
            }
        }

        $date = isset($dict['date']) ? new DateTime($dict['date']) : null;
        $addedAt = isset($dict['addedAt']) ? new DateTime($dict['addedAt']) : null;
        $lastEdited = isset($dict['lastEdited']) ? new DateTime($dict['lastEdited']) : null;

        return new self([
            'eventId' => $dict['eventId'],
            'title' => $dict['title'],
            'description' => $dict['description'] ?? '',
            'date' => $date,
            'duration' => $dict['duration'] ?? self::DURATION['ONE_HOUR_OR_LESS'],
            'locationAddress' => $dict['locationAddress'] ?? '',
            'locationPostcode' => $dict['locationPostcode'] ?? '',
            'location' => $location,
            'memberOnly' => filter_var($dict['memberOnly'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'externalRegister' => $dict['externalRegister'] ?? '',
            'localMeetRegister' => filter_var($dict['localMeetRegister'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'groupTags' => is_array($dict['groupTags'] ?? null) ? 
                $dict['groupTags'] : 
                (isset($dict['groupTags']) ? explode(';', (string)$dict['groupTags']) : []),
            'categoryTags' => is_array($dict['categoryTags'] ?? null) ? 
                $dict['categoryTags'] : 
                (isset($dict['categoryTags']) ? explode(';', (string)$dict['categoryTags']) : []),
            'contactPerson' => $dict['contactPerson'] ?? '',
            'contactDetails' => $dict['contactDetails'] ?? '',
            'contactVisibility' => $dict['contactVisibility'] ?? self::CONTACT_VISIBILITY['NOBODY'],
            'costIntroductory' => floatval($dict['costIntroductory'] ?? 0),
            'costRegular' => floatval($dict['costRegular'] ?? 0),
            'size' => $dict['size'] ?? self::EVENT_SIZE['SMALL'],
            'addedBy' => $dict['addedBy'] ?? null,
            'addedAt' => $addedAt,
            'lastEdited' => $lastEdited,
            'registeredUsers' => is_array($dict['registeredUsers'] ?? null) ?
                $dict['registeredUsers'] :
                (isset($dict['registeredUsers']) ? explode(';', (string)$dict['registeredUsers']) : []),
            'interestedUsers' => is_array($dict['interestedUsers'] ?? null) ?
                $dict['interestedUsers'] :
                (isset($dict['interestedUsers']) ? explode(';', (string)$dict['interestedUsers']) : []),
            'isCancelled' => filter_var($dict['isCancelled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'isDeleted' => filter_var($dict['isDeleted'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'originalFilePath' => $dict['originalFilename'] ?? null
        ]);
    }
}