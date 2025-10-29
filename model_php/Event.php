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
    public $eventLink;
    public $date;
    public $time;
    public $duration;
    public $organiser;
    public $organiserInfo;
    public $locationAddress;
    public $locationPostcode;
    public $locationLat;
    public $locationLong;
    public $groupWithMembership;
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
            'eventLink' => 'https://example.com/event',
            'date' => $exampleDate->format('Y-m-d\TH:i:s'),
            'time' => '19:00',
            'duration' => self::DURATION['ONE_TO_TWO'],
            'organiser' => 'Example Group',
            'organiserInfo' => 'https://example.com/group',
            'locationAddress' => '123 Example St',
            'locationPostcode' => 'SG12 0DE',
            'locationLat' => '51.811892',
            'locationLong' => '-0.03717',
            'groupWithMembership' => 'FALSE',
            'externalRegister' => 'FALSE',
            'localMeetRegister' => 'false',
            'groupTags' => ['exampleGroup'],
            'categoryTags' => ['exampleCategory'],
            'contactPerson' => 'Jane Doe',
            'contactDetails' => 'jane@example.com',
            'contactVisibility' => self::CONTACT_VISIBILITY['NOBODY'],
            'costIntroductory' => '0',
            'costRegular' => '0',
            'size' => 'TINY',
            'addedBy' => 'user1',
            'addedAt' => date('Y-m-d\TH:i:s.u'),
            'lastEdited' => date('Y-m-d\TH:i:s.u'),
            'registeredUsers' => [],
            'interestedUsers' => [],
            'isCancelled' => false,
            'isDeleted' => false,
            'originalFilePath' => null
        ]);
    }

    /**
     * @param array $options Array of event properties
     */
    public function __construct(array $options) {
        $this->eventId = $options['eventId'];
        $this->title = $options['title'];
        $this->description = $options['description'] ?? '';
        $this->eventLink = $options['eventLink'] ?? '';
        $this->date = $options['date'];
        $this->time = $options['time'] ?? '';
        $this->duration = $options['duration'] ?? self::DURATION['ONE_HOUR_OR_LESS'];
        $this->organiser = $options['organiser'] ?? '';
        $this->organiserInfo = $options['organiserInfo'] ?? '';
        $this->locationAddress = $options['locationAddress'] ?? '';
        $this->locationPostcode = $options['locationPostcode'] ?? '';
        $this->locationLat = $options['locationLat'] ?? '';
        $this->locationLong = $options['locationLong'] ?? '';
        $this->groupWithMembership = $options['groupWithMembership'] ?? 'FALSE';
        $this->externalRegister = $options['externalRegister'] ?? 'FALSE';
        $this->localMeetRegister = $options['localMeetRegister'] ?? 'false';
        $this->groupTags = $options['groupTags'] ?? [];
        $this->categoryTags = $options['categoryTags'] ?? [];
        $this->contactPerson = $options['contactPerson'] ?? '';
        $this->contactDetails = $options['contactDetails'] ?? '';
        $this->contactVisibility = $options['contactVisibility'] ?? self::CONTACT_VISIBILITY['NOBODY'];
        $this->costIntroductory = $options['costIntroductory'] ?? '0';
        $this->costRegular = $options['costRegular'] ?? '0';
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
        // Convert date strings to DateTime objects if needed
        if (isset($dict['date']) && is_string($dict['date'])) {
            $dict['date'] = new DateTime($dict['date']);
        }
        if (isset($dict['addedAt']) && is_string($dict['addedAt'])) {
            $dict['addedAt'] = new DateTime($dict['addedAt']);
        }
        if (isset($dict['lastEdited']) && is_string($dict['lastEdited'])) {
            $dict['lastEdited'] = new DateTime($dict['lastEdited']);
        }

        // Handle arrays
        $dict['groupTags'] = is_array($dict['groupTags'] ?? null) ? 
            $dict['groupTags'] : 
            (isset($dict['groupTags']) ? explode(';', (string)$dict['groupTags']) : []);

        $dict['categoryTags'] = is_array($dict['categoryTags'] ?? null) ? 
            $dict['categoryTags'] : 
            (isset($dict['categoryTags']) ? explode(';', (string)$dict['categoryTags']) : []);

        $dict['registeredUsers'] = is_array($dict['registeredUsers'] ?? null) ?
            $dict['registeredUsers'] :
            (isset($dict['registeredUsers']) ? explode(';', (string)$dict['registeredUsers']) : []);

        $dict['interestedUsers'] = is_array($dict['interestedUsers'] ?? null) ?
            $dict['interestedUsers'] :
            (isset($dict['interestedUsers']) ? explode(';', (string)$dict['interestedUsers']) : []);

        // Keep boolean values as strings where needed
        $dict['groupWithMembership'] = isset($dict['groupWithMembership']) ? 
            strtoupper((string)$dict['groupWithMembership']) : 'FALSE';
        $dict['externalRegister'] = isset($dict['externalRegister']) ? 
            strtoupper((string)$dict['externalRegister']) : 'FALSE';
        $dict['localMeetRegister'] = isset($dict['localMeetRegister']) ? 
            (string)$dict['localMeetRegister'] : 'false';

        return new self($dict);
    }
}