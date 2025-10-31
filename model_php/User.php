<?php

/**
 * User class representing a user in the LocalMeet system.
 */


require_once(__DIR__ . '/UserType.php');

class User {


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
        
    public $userType;
    public $eventFilesCreated = [];
    public $eventFilesEdited = [];

    /**
     * Construct a User from an optional associative array of options.
     * Mirrors the JS constructor which used an options object.
     *
     * @param array|null $opts
     */
    /**
     * Construct a User using explicit positional arguments.
     *
     * @param mixed $userID
     * @param string|null $username
     * @param string|null $name
     * @param string|null $email
     * @param string|\DateTime|null $dateJoined
     * @param array|Location|null $location
     * @param array|null $searchGroupTags
     * @param array|null $searchCategoryTags
     * @param array|null $daysTimesOfInterest
     * @param array|null $eventsReviewed
     * @param array|null $eventsRegisteredInterest
     * @param array|null $eventsSignedUpFor
     * @param array|null $eventsAttended
     * @param string|null $userType
     * @param array|null $eventFilesCreated
     * @param array|null $eventFilesEdited
     */
    public function __construct($userID = null, $username = null, $name = null, $email = null, $dateJoined = null, $location = null, $searchGroupTags = null, $searchCategoryTags = null, $daysTimesOfInterest = null, $eventsReviewed = null, $eventsRegisteredInterest = null, $eventsSignedUpFor = null, $eventsAttended = null, $userType = null, $eventFilesCreated = null, $eventFilesEdited = null) {
        $this->userID = $userID;
        $this->username = $username;
        $this->name = $name;
        $this->email = $email;

        if ($dateJoined !== null) {
            try {
                $this->dateJoined = $dateJoined instanceof DateTime ? $dateJoined : new DateTime($dateJoined);
            } catch (Exception $e) {
                $this->dateJoined = null;
            }
        }

        if (is_array($location)) {
            $this->location = Location::fromArray($location);
        } else {
            $this->location = $location;
        }

        $this->searchGroupTags = is_array($searchGroupTags) ? $searchGroupTags : [];
        $this->searchCategoryTags = is_array($searchCategoryTags) ? $searchCategoryTags : [];
        $this->daysTimesOfInterest = is_array($daysTimesOfInterest) ? $daysTimesOfInterest : [];
        $this->eventsReviewed = is_array($eventsReviewed) ? $eventsReviewed : [];
        $this->eventsRegisteredInterest = is_array($eventsRegisteredInterest) ? $eventsRegisteredInterest : [];
        $this->eventsSignedUpFor = is_array($eventsSignedUpFor) ? $eventsSignedUpFor : [];
        $this->eventsAttended = is_array($eventsAttended) ? $eventsAttended : [];

    $this->userType = $userType ?: UserType::MEMBER->value;
        $this->eventFilesCreated = is_array($eventFilesCreated) ? $eventFilesCreated : [];
        $this->eventFilesEdited = is_array($eventFilesEdited) ? $eventFilesEdited : [];
    }

    /**
     * Create a User from an associative array (e.g., parsed JSON).
     * @param array $data
     * @return User
     */
    public static function fromArray(array $data) {
        $userID = isset($data['userID']) ? $data['userID'] : null;
        $username = isset($data['username']) ? $data['username'] : null;
        $name = isset($data['name']) ? $data['name'] : null;
        $email = isset($data['email']) ? $data['email'] : null;
        $dateJoined = isset($data['dateJoined']) ? $data['dateJoined'] : null;
        $location = isset($data['location']) ? Location::fromArray($data['location']) : null;
        $searchGroupTags = isset($data['searchGroupTags']) ? $data['searchGroupTags'] : [];
        $searchCategoryTags = isset($data['searchCategoryTags']) ? $data['searchCategoryTags'] : [];
        $daysTimesOfInterest = isset($data['daysTimesOfInterest']) ? $data['daysTimesOfInterest'] : [];
        $eventsReviewed = isset($data['eventsReviewed']) ? $data['eventsReviewed'] : [];
        $eventsRegisteredInterest = isset($data['eventsRegisteredInterest']) ? $data['eventsRegisteredInterest'] : [];
        $eventsSignedUpFor = isset($data['eventsSignedUpFor']) ? $data['eventsSignedUpFor'] : [];
        $eventsAttended = isset($data['eventsAttended']) ? $data['eventsAttended'] : [];
    $userType = isset($data['userType']) ? $data['userType'] : UserType::MEMBER->value;
        $eventFilesCreated = isset($data['eventFilesCreated']) ? $data['eventFilesCreated'] : [];
        $eventFilesEdited = isset($data['eventFilesEdited']) ? $data['eventFilesEdited'] : [];

        return new User($userID, $username, $name, $email, $dateJoined, $location, $searchGroupTags, $searchCategoryTags, $daysTimesOfInterest, $eventsReviewed, $eventsRegisteredInterest, $eventsSignedUpFor, $eventsAttended, $userType, $eventFilesCreated, $eventFilesEdited);
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

    public function writeToJsonFile($filepath) {
        $data = $this->toArray();
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        file_put_contents($filepath, $json);
    }
}

// Optionally expose a simple alias for backward compatibility
class_alias('User', 'LocalMeetUser');
