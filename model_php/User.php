<?php

/**
 * PHP translation of model/User.js
 * Provides a User class with similar shape and behavior.
 */


class User {
    // User types
    const USER_TYPE_MEMBER = 'member';
    const USER_TYPE_ORGANIZER = 'organizer';
    const USER_TYPE_MODERATOR = 'moderator';
    const USER_TYPE_ADMIN = 'admin';

    public $userID;
    public $username;
    public $name;
    public $email;
    /** @var \DateTime|null */
    public $dateJoined;
    /** @var Location|null */
    public $location;
    public $searchGroupTags = [];
    public $searchCategoryTags = [];
    public $daysTimesOfInterest = [];
    public $eventsReviewed = [];
    public $eventsRegisteredInterest = [];
    public $eventsSignedUpFor = [];
    public $eventsAttended = [];
    public $userType = self::USER_TYPE_MEMBER;
    public $eventFilesCreated = [];
    public $eventFilesEdited = [];

    /**
     * Construct a User from an optional associative array of options.
     * Mirrors the JS constructor which used an options object.
     *
     * @param array|null $opts
     */
    public function __construct($opts = null) {
        if ($opts === null) return;

        $this->userID = isset($opts['userID']) ? $opts['userID'] : null;
        $this->username = isset($opts['username']) ? $opts['username'] : null;
        $this->name = isset($opts['name']) ? $opts['name'] : null;
        $this->email = isset($opts['email']) ? $opts['email'] : null;

        if (isset($opts['dateJoined'])) {
            try {
                $this->dateJoined = new DateTime($opts['dateJoined']);
            } catch (Exception $e) {
                // If it's not parseable, keep raw value as null
                $this->dateJoined = null;
            }
        }

        $this->location = isset($opts['location']) ? Location::fromArray($opts['location']) : null;

        $this->searchGroupTags = isset($opts['searchGroupTags']) && is_array($opts['searchGroupTags']) ? $opts['searchGroupTags'] : [];
        $this->searchCategoryTags = isset($opts['searchCategoryTags']) && is_array($opts['searchCategoryTags']) ? $opts['searchCategoryTags'] : [];
        $this->daysTimesOfInterest = isset($opts['daysTimesOfInterest']) && is_array($opts['daysTimesOfInterest']) ? $opts['daysTimesOfInterest'] : [];
        $this->eventsReviewed = isset($opts['eventsReviewed']) && is_array($opts['eventsReviewed']) ? $opts['eventsReviewed'] : [];
        $this->eventsRegisteredInterest = isset($opts['eventsRegisteredInterest']) && is_array($opts['eventsRegisteredInterest']) ? $opts['eventsRegisteredInterest'] : [];
        $this->eventsSignedUpFor = isset($opts['eventsSignedUpFor']) && is_array($opts['eventsSignedUpFor']) ? $opts['eventsSignedUpFor'] : [];
        $this->eventsAttended = isset($opts['eventsAttended']) && is_array($opts['eventsAttended']) ? $opts['eventsAttended'] : [];

        $this->userType = isset($opts['userType']) ? $opts['userType'] : self::USER_TYPE_MEMBER;

        $this->eventFilesCreated = isset($opts['eventFilesCreated']) && is_array($opts['eventFilesCreated']) ? $opts['eventFilesCreated'] : [];
        $this->eventFilesEdited = isset($opts['eventFilesEdited']) && is_array($opts['eventFilesEdited']) ? $opts['eventFilesEdited'] : [];
    }

    /**
     * Create a User from an associative array (e.g., parsed JSON).
     * @param array $data
     * @return User
     */
    public static function fromArray(array $data) {
        $opts = [];
        $opts['userID'] = isset($data['userID']) ? $data['userID'] : null;
        $opts['username'] = isset($data['username']) ? $data['username'] : null;
        $opts['name'] = isset($data['name']) ? $data['name'] : null;
        $opts['email'] = isset($data['email']) ? $data['email'] : null;
        $opts['dateJoined'] = isset($data['dateJoined']) ? $data['dateJoined'] : null;
        $opts['location'] = isset($data['location']) ? $data['location'] : null;
        $opts['searchGroupTags'] = isset($data['searchGroupTags']) ? $data['searchGroupTags'] : [];
        $opts['searchCategoryTags'] = isset($data['searchCategoryTags']) ? $data['searchCategoryTags'] : [];
        $opts['daysTimesOfInterest'] = isset($data['daysTimesOfInterest']) ? $data['daysTimesOfInterest'] : [];
        $opts['eventsReviewed'] = isset($data['eventsReviewed']) ? $data['eventsReviewed'] : [];
        $opts['eventsRegisteredInterest'] = isset($data['eventsRegisteredInterest']) ? $data['eventsRegisteredInterest'] : [];
        $opts['eventsSignedUpFor'] = isset($data['eventsSignedUpFor']) ? $data['eventsSignedUpFor'] : [];
        $opts['eventsAttended'] = isset($data['eventsAttended']) ? $data['eventsAttended'] : [];
        $opts['userType'] = isset($data['userType']) ? $data['userType'] : self::USER_TYPE_MEMBER;
        $opts['eventFilesCreated'] = isset($data['eventFilesCreated']) ? $data['eventFilesCreated'] : [];
        $opts['eventFilesEdited'] = isset($data['eventFilesEdited']) ? $data['eventFilesEdited'] : [];

        return new User($opts);
    }

    /**
     * Add an edited event file to the user if it does not already exist
     * @param string $filename
     */
    public function addEditedEventFile($filename) {
        if (!in_array($filename, $this->eventFilesEdited, true)) {
            $this->eventFilesEdited[] = $filename;
        }
    }

    /**
     * Return array representation (useful for JSON encoding)
     * @return array
     */
    public function toArray() {
        return [
            'userID' => $this->userID,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
            'dateJoined' => $this->dateJoined ? $this->dateJoined->format(DateTime::ATOM) : null,
            'location' => $this->location ? $this->location->toArray() : null,
            'searchGroupTags' => $this->searchGroupTags,
            'searchCategoryTags' => $this->searchCategoryTags,
            'daysTimesOfInterest' => $this->daysTimesOfInterest,
            'eventsReviewed' => $this->eventsReviewed,
            'eventsRegisteredInterest' => $this->eventsRegisteredInterest,
            'eventsSignedUpFor' => $this->eventsSignedUpFor,
            'eventsAttended' => $this->eventsAttended,
            'userType' => $this->userType,
            'eventFilesCreated' => $this->eventFilesCreated,
            'eventFilesEdited' => $this->eventFilesEdited
        ];
    }
}

// Optionally expose a simple alias for backward compatibility
class_alias('User', 'LocalMeetUser');
