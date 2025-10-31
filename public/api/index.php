<?php
require_once(__DIR__ . '/../../model_php/file_api.php');

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

// Start PHP session so requireLogin can check session user
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Require a logged-in user, otherwise redirect to site root.
 */
function requireLogin() {
    if (empty($_SESSION['user'])) {
        // Redirect to the SPA root (frontend will show login)
        header('Location: /');
        exit;
    }
}

// Serve private HTML files (from project root /private) via this API script
if ($path === '/event-form') {
    // Only allow access to logged-in users
    requireLogin();

    $file = __DIR__ . '/../../private/event-form.html';
    if (is_readable($file)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($file);
        exit;
    }
    http_response_code(404);
    echo 'Not Found';
    exit;
}

if ($path === '/user-profile-form') {    
    requireLogin();

    $file = __DIR__ . '/../../private/user-profile-form.html';
    if (is_readable($file)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($file);
        exit;
    }
    http_response_code(404);
    echo 'Not Found';
    exit;
}

/*
/api/events                                    # Get all events (default 2 months from now)
/api/events?startDate=2025-11-01              # Get events from November 1st
/api/events?startDate=2025-11-01&endDate=2025-12-31  # Get events for specific date range
/api/events?latitude=51.8&longitude=-0.03&distance=10 # Get events within 10km of location
*/
if ($path === '/events') {
    
    
    header('Content-Type: application/json; charset=utf-8');
    
    $options = [];
    
    // Handle date filters
    if (!empty($_GET['startDate'])) {
        $options['startDate'] = $_GET['startDate'];
    }
    if (!empty($_GET['endDate'])) {
        $options['endDate'] = $_GET['endDate'];
    }
    
    // Handle location filters
    if (!empty($_GET['latitude']) && !empty($_GET['longitude'])) {
        $options['location'] = [
            'latitude' => floatval($_GET['latitude']),
            'longitude' => floatval($_GET['longitude'])
        ];
        
        if (!empty($_GET['distance'])) {
            $options['distance'] = floatval($_GET['distance']);
        }
    }
    
    try {
        $events = getEvents($options);
        // Convert events to array for JSON serialization
        $eventsArray = array_map(function($event) {
            return (array)$event;
        }, $events);
        
        echo json_encode($eventsArray, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal Server Error',
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if ($path === '/get-category-tags') {
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $tags = getCategoryTags();
        // Convert CategoryTag objects to arrays for JSON serialization
        $tagsArray = array_map(function($tag) {
            return [
                'name' => $tag->name,
                'description' => $tag->description
            ];
        }, $tags);
        
        echo json_encode($tagsArray, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal Server Error',
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if ($path === '/get-group-tags') {
    header('Content-Type: application/json; charset=utf-8');
    
    try {
        $tags = getGroupTags();
        // Convert CategoryTag objects to arrays for JSON serialization
        $tagsArray = array_map(function($tag) {
            return [
                'name' => $tag->name,
                'description' => $tag->description
            ];
        }, $tags);
        
        echo json_encode($tagsArray, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal Server Error',
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if ($path === '/create-user') {
    header('Content-Type: application/json; charset=utf-8');
    
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'error' => 'Method Not Allowed',
            'message' => 'Only POST requests are allowed for this endpoint'
        ]);
        exit;
    }

    // Get JSON data from request body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Bad Request',
            'message' => 'Username and password are required'
        ]);
        exit;
    }

    try {
        $userId = appendUserToLookup($data['username'], $data['password']);
        http_response_code(201); // Created
        echo json_encode([
            'success' => true,
            'userId' => $userId,
            'message' => 'User created successfully'
        ]);
    } catch (Exception $e) {
        $statusCode = 500;
        if (strpos($e->getMessage(), 'Username already exists') !== false) {
            $statusCode = 409; // Conflict
        } else if (strpos($e->getMessage(), 'must be') !== false) {
            $statusCode = 400; // Bad Request
        }
        http_response_code($statusCode);
        echo json_encode([
            'error' => $statusCode === 409 ? 'Conflict' : ($statusCode === 400 ? 'Bad Request' : 'Internal Server Error'),
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

if ($path === '/login') {
    header('Content-Type: application/json; charset=utf-8');

    // Only allow POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed', 'message' => 'Only POST allowed']);
        exit;
    }

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!$data || empty($data['username']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username and password are required']);
        exit;
    }

    try {
        // tryLogin will throw on invalid credentials
        $user = tryLogin($data['username'], $data['password']);

        // Load full user details if possible
        $userObj = null;
        if (!empty($user['filename'])) {
            $userObj = getUserDetailsByFilename($user['filename']);
        }

        if ($userObj !== null) {
            // store user array in session
            $_SESSION['user'] = $userObj->toArray();
        } else {
            // raise exception if no user found
            throw new Exception('User details not found');

        }

        // Persist session
        session_write_close();

        echo json_encode(['success' => true, 'message' => 'Login successful']);
    } catch (Exception $e) {
        $msg = $e->getMessage();
        if (stripos($msg, 'required') !== false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $msg]);
        } elseif (stripos($msg, 'not found') !== false || stripos($msg, 'invalid password') !== false) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => $msg]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $msg]);
        }
    }
    exit;
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Not Found';

