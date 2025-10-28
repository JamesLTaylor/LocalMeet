<?php
// Simple router for /api and /api/current-user


// Determine path in a robust way (PATH_INFO preferred)
$path = '/';
if (!empty($_SERVER['PATH_INFO'])) {
    $path = $_SERVER['PATH_INFO'];
} else {
    // Try to derive from REQUEST_URI relative to script name
    $request = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $script = $_SERVER['SCRIPT_NAME']; // e.g. /test2/api/index.php
    if (strpos($request, $script) === 0) {
        $path = substr($request, strlen($script));
    } else {
    $base = rtrim(dirname($script), "\\/"); // e.g. /test2/api
    if (strpos($request, $base) === 0) {
            $path = substr($request, strlen($base));
        }
    }
    if ($path === '') {
        $path = '/';
    }
}

$path = '/' . ltrim($path, '/');
$path = rtrim($path, '/');

if ($path === '' || $path === '/') {
    header('Content-Type: text/plain; charset=utf-8');
    echo 'hello world';
    exit;
}

if ($path === '/current-user') {
    header('Content-Type: application/json; charset=utf-8');
    $payload = [
        'name' => 'James',
        'surname' => 'Taylor',
        'userId' => 1,
    ];
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Not Found';

