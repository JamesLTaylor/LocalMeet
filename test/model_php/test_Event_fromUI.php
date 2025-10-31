<?php

require_once __DIR__ . '/../../model_php/User.php';
require_once __DIR__ . '/../../model_php/Event.php';
require_once __DIR__ . "/test_utils.php";

$baseDir = __DIR__ . '/../test_data';

$jsonStr = '{"title":"Example Event",
    "description":"This is an example event.",
    "eventLink": "https://www.localorg.co.uk/event101",
    "date":"2025-11-21",
    "time":"19:00",
    "duration":"1_to_2",
    "organiser":"Example Organiser",
    "organiserInfo":"https://www.localorg.co.uk",
    "locationAddress":"123 Example St",
    "locationPostcode":"SG12 0DE",
    "groupWithMembership": "FALSE",
    "externalRegister":"FALSE",
    "localMeetRegister":"False",
    "contactPerson":"Jane Doe",
    "contactDetails":"jane@example.com",
    "contactVisibility":"NOBODY",
    "costIntroductory":"0",
    "costRegular":"0",
    "size":"TINY",
    "eventId":"evt_example"}';

$event = new Event(json_decode($jsonStr, true));

$user = new User();
$event->writeToJsonFile($baseDir, $user);

fwrite(STDOUT, "All tests passed.\n");
exit(0);
