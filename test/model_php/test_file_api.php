<?php
// Simple test runner for getUserDetailsByFilename
// php .\test\model_php\test_file_api.php

require_once __DIR__ . '/../../model_php/file_api.php';
setDataDirectory(__DIR__ . '/../test_data');

function assertTrue($cond, $message = '') {
    if (!$cond) {
        fwrite(STDERR, "Assertion failed: $message\n");
        exit(1);
    }
}

// Test 0: create a user and save it to a test file
$location = new Location(50, 0);
$userData = [];
$user = new User();
$user->setUsername('James');
$user->setEmail('james@example.com');
saveUserDetailsToFile($user);

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
exit(0);
