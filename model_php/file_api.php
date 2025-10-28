<?php

require_once(__DIR__ . '/Event.php');
require_once(__DIR__ . '/utils.php');
require_once(__DIR__ . '/CategoryTag.php');

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