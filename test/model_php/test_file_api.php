<?php
// Simple test runner for getUserDetailsByFilename
// php .\test\model_php\test_file_api.php

require_once __DIR__ . '/../../model_php/file_api.php';
require_once __DIR__ . '/../../model_php/UserType.php';
require_once __DIR__ . "test_utils.php";

setDataDirectory(__DIR__ . '/../test_data');


// Test 0: create a user and save it to a test file
$location = new Location(50, 0);
$userData = [];
$user = new User("1", 
"james", 
"James Smith", 
"james@example.com", 
"2023-01-01",
 $location, 
 [], 
 [], 
 [], 
 [], 
 [], 
 [], 
 [], 
 UserType::MEMBER->value,
 [], 
 []);

$user->writeToJsonFile(getDataDirectory() . '/users/username.json');

// Test 1: existing file
$existing = 'username.json';
$user = getUserDetailsByFilename($existing);
assertTrue($user !== null, "Expected user object for $existing");
assertTrue(method_exists($user, 'toArray'), "Returned object should be a User instance");
$arr = $user->toArray();
assertTrue(isset($arr['username']) && strtolower($arr['username']) === strtolower('James'), "Username should match James");

// Test 2: non-existent file
$missing = 'this_file_does_not_exist.json';
$u2 = getUserDetailsByFilename($missing);
assertTrue($u2 === null, "Expected null for missing file");

fwrite(STDOUT, "All tests passed.\n");
//delete file that was written
unlink(getDataDirectory() . '/users/username.json');
fwrite(STDOUT, "Test file deleted.\n");
exit(0);
