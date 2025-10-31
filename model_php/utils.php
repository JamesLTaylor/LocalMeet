<?php

require_once(__DIR__ . '/../data/location/postCodes.php');

/**
 * Calculate the distance between two lat/lon points in kilometers using the Haversine formula
 * @param float $lat1
 * @param float $lon1
 * @param float $lat2
 * @param float $lon2
 * @return float
 */
function haversine($lat1, $lon1, $lat2, $lon2)
{
    $R = 6371; // km
    $dLat = ($lat2 - $lat1) * M_PI / 180;
    $dLon = ($lon2 - $lon1) * M_PI / 180;
    $a = sin($dLat / 2) * sin($dLat / 2) +
        cos($lat1 * M_PI / 180) * cos($lat2 * M_PI / 180) *
        sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return $R * $c;
}

/**
 * Location class for latitude/longitude
 */
class Location
{
    /** @var float */
    public $latitude;

    /** @var float */
    public $longitude;

    /**
     * @param float $latitude
     * @param float $longitude
     */
    public function __construct($latitude, $longitude)
    {
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    // method to create Location from array
    public static function fromArray($arr)
    {
        if (!is_array($arr) || !isset($arr['latitude']) || !isset($arr['longitude'])) {
            return null;
        }
        return new Location(floatval($arr['latitude']), floatval($arr['longitude']));
    }

    // method to convert Location to array
    public function toArray()
    {
        return [
            'latitude' => $this->latitude,
            'longitude' => $this->longitude
        ];
    }
}

/**
 * Get location from postcode
 * @param string $postcode
 * @return Location
 * @throws Exception
 */
function locationFromPostcode($postcode)
{
    global $postCodes, $postCodeAreas;

    $postcode = strtoupper(preg_replace('/\s+/', '', $postcode));
    if (strlen($postcode) !== 7) {
        throw new Exception('Incorrect postcode format');
    }

    $key = substr($postcode, 0, 4) . ' ' . substr($postcode, 4);
    if (!isset($postCodes[$key])) {
        throw new Exception('Postcode not found, please enter a valid postcode in one of ' . implode(', ', $postCodeAreas));
    }

    $coordinates = $postCodes[$key];
    return new Location($coordinates[0], $coordinates[1]);
}

function makeDirsAndWriteFile($fullPath, $content)
{
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    file_put_contents($fullPath, $content);
}
