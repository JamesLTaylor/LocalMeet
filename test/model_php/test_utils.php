<?php
function assertTrue($cond, $message = '')
{
    if (!$cond) {
        fwrite(STDERR, "Assertion failed: $message\n");
        exit(1);
    }
    fwrite(STDOUT, "Test OK: $message\n");
}

function assertFalse($cond, $message = "")
{
    if ($cond) {
        fwrite(STDERR, "Assertion failed: $message\n");
        exit(1);
    }
    fwrite(STDOUT, "Test OK: $message\n");
}
