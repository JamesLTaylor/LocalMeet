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

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Not Found';

