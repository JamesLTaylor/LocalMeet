<?php

require_once __DIR__ . '/../../model_php/User.php';
require_once __DIR__ . '/../../model_php/Event.php';
require_once __DIR__ . "/test_utils.php";

$baseDir = __DIR__ . '/../test_data';

$eventData = [
    "eventId" => 1,
    "title" => "Sample Event",
    "description" => "This is a sample event for testing.",
    "eventLink" => "http://example.com/event",
    "date" => new DateTime("2024-12-31"),
    "time" => "18:00",
    "duration" => Event::DURATION['TWO_TO_THREE'],
    "organiser" => "Test Organiser",
    "organiserInfo" => "Contact info for organiser.",
    "locationAddress" => "123 Test St, Test City",
    "locationPostcode" => "TE5 7ST",
    "locationLat" => 50.0,
    "locationLong" => 0.0,
    "groupWithMembership" => true,
    "externalRegister" => false,
    "localMeetRegister" => true,
    "groupTags" => ["tag1", "tag2"],
    "categoryTags" => ["category1"],
    "contactPerson" => "John Doe",
    "contactDetails" => "john.doe@example.com",
    "originalFilePath" => "2024/12/31_old_sample_event.json"
];
$event = new Event($eventData);

$user = new User($eventFilesCreated = []);
$event->writeToJsonFile($baseDir, $user);

assertFalse(in_array("2024/12/31_old_sample_event.json", $user->eventFilesCreated, true), "Old event file should not be in created files");
// fwrite(STDOUT, implode(", ", $user->eventFilesCreated));
assertTrue(in_array("2024/12/31_sample_event.json", $user->eventFilesCreated, true), "New event file should be in created files");

$loadedEvent = Event::fromJsonFile($baseDir . "/events/2024/12/31_sample_event.json");
assertTrue($loadedEvent !== null, "Loaded event should not be null");
assertTrue($loadedEvent->title === $eventData['title'], "Event title should match");

// delete test file
unlink($baseDir . '/events/2024/12/31_sample_event.json');

fwrite(STDOUT, "All tests passed.\n");
exit(0);
