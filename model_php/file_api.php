<?php

require_once(__DIR__ . '/Event.php');
require_once(__DIR__ . '/utils.php');
require_once(__DIR__ . '/CategoryTag.php');
require_once(__DIR__ . '/User.php');

/**
 * Get a list of events filtered by date range and location.
 * @param array $options - Options array
 * @param DateTime|string|null $options['startDate'] - Start date (inclusive)
 * @param DateTime|string|null $options['endDate'] - End date (inclusive)
 * @param array|null $options['location'] - Center location with 'latitude' and 'longitude' keys
 * @param float|null $options['distance'] - Max distance in kilometers
 * @return array Array of Event objects
 */
function getEvents($options = []) {
    $startDate = isset($options['startDate']) ? $options['startDate'] : new DateTime();
    if (is_string($startDate)) {
        $startDate = new DateTime($startDate);
    }
    
    $endDate = isset($options['endDate']) ? $options['endDate'] : null;
    if (!$endDate) {
        $endDate = clone $startDate;
        $endDate->modify('+60 days'); // Default to 2 months ahead
    } else if (is_string($endDate)) {
        $endDate = new DateTime($endDate);
    }

    $location = $options['location'] ?? null;
    $distance = $options['distance'] ?? null;
    
    $events = [];
    
    // Get all months and years from startDate to endDate, inclusive
    $currentYear = (int)$startDate->format('Y');
    $currentMonth = (int)$startDate->format('n');
    $endYear = (int)$endDate->format('Y');
    $endMonth = (int)$endDate->format('n');
    
    $monthsToLoad = [];
    $year = $currentYear;
    $month = $currentMonth;
    
    // Generate all months from start to end
    while ($year < $endYear || ($year === $endYear && $month <= $endMonth)) {
        $monthsToLoad[] = [
            'year' => $year,
            'month' => str_pad($month, 2, '0', STR_PAD_LEFT)
        ];
        $month++;
        if ($month > 12) {
            $month = 1;
            $year++;
        }
    }
    
    $eventsDir = __DIR__ . '/../data/events';
    
    foreach ($monthsToLoad as $monthData) {
        $year = $monthData['year'];
        $month = $monthData['month'];
        $monthDir = $eventsDir . '/' . $year . '/' . $month;
        
        if (is_dir($monthDir)) {
            $files = array_filter(
                scandir($monthDir) ?: [],
                fn($f) => substr($f, -5) === '.json'
            );
            
            foreach ($files as $file) {
                $filePath = $monthDir . '/' . $file;
                try {
                    $data = json_decode(file_get_contents($filePath), true);
                    if (!$data) {
                        continue;
                    }
                    
                    // Optionally filter by location/distance
                    $include = true;
                    if ($location && $distance && 
                        isset($data['location']) && 
                        is_array($data['location'])) {
                            
                        $d = haversine(
                            floatval($data['location']['latitude']),
                            floatval($data['location']['longitude']),
                            floatval($location['latitude']),
                            floatval($location['longitude'])
                        );
                        
                        if ($d > $distance) {
                            $include = false;
                        }
                    }
                    
                    if ($include) {
                        $events[] = new Event($data);
                    }
                } catch (Exception $e) {
                    // Skip invalid file
                    error_log("Error processing event file $filePath: " . $e->getMessage());
                }
            }
        }
    }
    
    return $events;
}

/**
 * Get a list of CategoryTags from categoryTags.csv
 * @return array Array of CategoryTag objects
 */
function getCategoryTags() {
    return getTags(__DIR__ . '/../data/tags/categoryTags.csv');
}

/**
 * Get a list of group tags from groupTags.csv
 * @return array Array of CategoryTag objects
 */
function getGroupTags() {
    return getTags(__DIR__ . '/../data/tags/groupTags.csv');
}

function checkUserNameExists($username) {
    $filePath = __DIR__ . '/../data/users/_user_lookup.csv';
    
    if (file_exists($filePath)) {
        if (($handle = fopen($filePath, "r")) !== false) {
            while (($row = fgetcsv($handle)) !== false) {
                if (isset($row[1]) && strtolower($row[1]) === strtolower($username)) {
                    fclose($handle);
                    return true;
                }
            }
            fclose($handle);
        }
    }
    return false;
}

/**
 * Append a new user to _user_lookup.csv and return the new userID.
 * Validates username and password before appending.
 * @param string $username
 * @param string $password
 * @return int The new user ID
 * @throws Exception if validation fails or username exists
 */
function appendUserToLookup($username, $password) {
    // Validate username: only alphanumeric, no spaces
    if (!preg_match('/^[a-zA-Z0-9]+$/', $username)) {
        throw new Exception('Username must be alphanumeric with no spaces');
    }

    // Validate password: at least 8 chars, mix of upper, lower, number, special
    if (!is_string($password) ||
        strlen($password) < 8 ||
        !preg_match('/[A-Z]/', $password) ||
        !preg_match('/[a-z]/', $password) ||
        !preg_match('/[0-9]/', $password) ||
        !preg_match('/[^A-Za-z0-9]/', $password)) {
        throw new Exception(
            'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
        );
    }

    $filePath = __DIR__ . '/../data/users/_user_lookup.csv';
    
    // Check if username exists and find lastId in one pass
    $usernameExists = false;
    $lastId = 0;
    
    if (file_exists($filePath)) {
        if (($handle = fopen($filePath, "r")) !== false) {
            while (($row = fgetcsv($handle)) !== false) {
                if (isset($row[1]) && strtolower($row[1]) === strtolower($username)) {
                    $usernameExists = true;
                    break;
                }
                if (isset($row[0]) && is_numeric($row[0])) {
                    $id = (int)$row[0];
                    if ($id > $lastId) {
                        $lastId = $id;
                    }
                }
            }
            fclose($handle);
        }
    }

    if ($usernameExists) {
        throw new Exception('Username already exists');
    }

    // Generate hash
    $passwordHash = password_hash($password, PASSWORD_ARGON2ID);

    $nextId = $lastId + 1;
    // Compose row
    $filename = strtolower($username) . '.json';
    
    // Create CSV row with password hash properly quoted
    $row = [
        $nextId,
        $username,
        $passwordHash,
        $filename
    ];

    // Append to file and return userID
    if (($handle = fopen($filePath, "a")) !== false) {
        if (fputcsv($handle, $row) === false) {
            fclose($handle);
            throw new Exception('Failed to write to user lookup file');
        }
        fclose($handle);
        return $nextId;
    }
    
    throw new Exception('Could not open user lookup file for writing');
}

/**
 * Try to login with username and password. Throws an Exception on failure.
 * Returns an associative array with keys: userID, username, passwordHash, filename
 * @param string $username
 * @param string $password
 * @return array|null
 * @throws Exception
 */
function tryLogin($username, $password) {
    if (!$username || !$password) {
        throw new Exception('Username and password are required');
    }

    $user = getUserCredentialsByName($username);
    echo "User fetched: " . json_encode($user) . "\n"; // Debug line
    if (!$user) {
        echo "User not found\n"; // Debug line
        throw new Exception('User not found');
    }

    if (!isset($user['passwordHash'])) {
        throw new Exception('Invalid user record');
    }

    // Verify password using PHP's password_verify (supports Argon2)
    if (!password_verify($password, $user['passwordHash'])) {
        throw new Exception('Invalid password');
    }

    return $user;
}

/**
 * Get user credentials by username from _user_lookup.csv
 * Returns associative array with keys: userID, username, passwordHash, filename
 * @param string $username
 * @return array|null
 * @throws Exception
 */
function getUserCredentialsByName($username) {
    if (!$username) {
        throw new Exception('Username is required');
    }
    // Normalize username to lowercase
    $username = strtolower(trim($username));

    $filePath = __DIR__ . '/../data/users/_user_lookup.csv';
    if (($handle = fopen($filePath, 'r')) === false) {
        return null;
    }

    $header = fgetcsv($handle);    
    $headerMap = [];    
    foreach ($header as $i => $col) {
        $headerMap[$i] = strtolower(trim($col));
    }

    while (($row = fgetcsv($handle)) !== false) {
        $assoc = [];
        echo "Row: " . implode(", ", $row) . "\n"; // Debug line
        foreach ($row as $i => $val) {
            $key = isset($headerMap[$i]) ? $headerMap[$i] : $i;
            $assoc[$key] = $val;
        }
        echo "Checking username: " . $assoc['username'] . "\n"; // Debug line
        echo "Against: " . $username . "\n"; // Debug line
        echo "Result: " . (strtolower($assoc['username']) === $username) . "\n"; // Debug line
        if (isset($assoc['username']) && strtolower($assoc['username']) === $username) {
            fclose($handle);            
            $result =  [
                'userID' => $assoc['userid'] ?? ($assoc['userID'] ?? null),
                'username' => $assoc['username'],
                'passwordHash' => $assoc['passwordhash'] ?? ($assoc['passwordHash'] ?? null),
                'filename' => $assoc['filename'] ?? null,
            ];
            echo "returning user: " . json_encode($result) . "\n"; // Debug line
            return $result;
        }        
    }

    fclose($handle);
    return null;
}

/**
 * Get an instance of User given a JSON filename (located in data/users)
 * @param string $filename
 * @return User|null
 */
function getUserDetailsByFilename($filename) {
    if (!$filename) return null;

    $filePath = __DIR__ . '/../data/users/' . $filename;
    if (!is_readable($filePath)) {
        return null;
    }

    $json = file_get_contents($filePath);
    if ($json === false) return null;

    $data = json_decode($json, true);
    if ($data === null) return null;

    // Use User::fromArray to construct a User instance
    return User::fromArray($data);
}




/**
 * Get a list of tags from a CSV file
 * @param string $tagPath Path to the CSV file
 * @return array Array of CategoryTag objects
 * @throws Exception if file is not found or not readable
 */
function getTags($tagPath) {
    if (!is_readable($tagPath)) {
        throw new Exception("$tagPath not found or not readable");
    }

    $tags = [];
    
    if (($handle = fopen($tagPath, "r")) !== false) {
        // Read and skip the header row
        $header = fgetcsv($handle);
        
        // Get the column indices
        $nameIndex = array_search('name', array_map('strtolower', $header));
        $descIndex = array_search('description', array_map('strtolower', $header));
        
        if ($nameIndex === false) {
            fclose($handle);
            throw new Exception("CSV file must have a 'name' column");
        }
        
        while (($data = fgetcsv($handle)) !== false) {
            if (isset($data[$nameIndex]) && !empty($data[$nameIndex])) {
                $description = ($descIndex !== false && isset($data[$descIndex])) ? $data[$descIndex] : '';
                $tags[] = new CategoryTag([
                    'name' => $data[$nameIndex],
                    'description' => $description
                ]);
            }
        }
        fclose($handle);
    }
    
    return $tags;
}

