<?php
// Simple test runner for getUserDetailsByFilename
// php .\test\model_php\test_file_api.php

require_once __DIR__ . '/../../model_php/file_api.php';

function assertTrue($cond, $message = '') {
    if (!$cond) {
        fwrite(STDERR, "Assertion failed: $message\n");
        exit(1);
    }
}

// Test 1: existing file
$existing = 'james.json';
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
