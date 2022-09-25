<?php
header('Content-Type: application/json; charset=utf-8');
// header("Content-Type: text/html; charset=utf-8");

define("URL_GSSN_WEBSERVICE", "https://services-mbvd-mercedes-benz-de.pixelpark.net/gssn-services/");

define("PATH_GET_GEODAT_BY_ZIP", "outlet/v2/DE/geo/50/search");
define("GET_PARAMETER_ZIPCODE", "zipcode");
define("PATH_GET_RETAILER_BY_GEODATA_AND_PRDGRPDEF", "outlet/v2/DE/_prdgrpdef/Passenger_Car/geo/100/Mercedes-Benz/sales,service");
define("GET_PARAMETER_LON", "lon");
define("GET_PARAMETER_LAT", "lat");
define("GET_PARAMETER_LIMIT", "limit");
define("GET_VALUE_PARAMETER_LIMIT", "10");


$zipcode = isset($_GET['zipcode']) ? $_GET['zipcode'] : "";
$lon = isset($_GET['lon']) ? $_GET['lon'] : "";
$lat = isset($_GET['lat']) ? $_GET['lat'] : "";

$resultProxyJson = "null";

if ($zipcode) {
	$arrayGetParameter = array(GET_PARAMETER_ZIPCODE => $zipcode);
	$resultProxyJson = CallAPI('GET', URL_GSSN_WEBSERVICE . PATH_GET_GEODAT_BY_ZIP, $arrayGetParameter);
} elseif ($lon and $lat) {
	$arrayGetParameter = array(GET_PARAMETER_LON => $lon, GET_PARAMETER_LAT => $lat, GET_PARAMETER_LIMIT => GET_VALUE_PARAMETER_LIMIT );
	$resultProxyJson = CallAPI('GET', URL_GSSN_WEBSERVICE . PATH_GET_RETAILER_BY_GEODATA_AND_PRDGRPDEF, $arrayGetParameter);
}

echo($resultProxyJson);


function CallAPI($method, $url, $data = false)
{
	$curl = curl_init();

    switch ($method)
    {
        case "POST":
            curl_setopt($curl, CURLOPT_POST, 1);

            if ($data)
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            break;
        case "PUT":
            curl_setopt($curl, CURLOPT_PUT, 1);
            break;
        default:
            if ($data)
                $url = sprintf("%s?%s", $url, http_build_query($data));
    }


    // Optional Authentication:
    // curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    // curl_setopt($curl, CURLOPT_USERPWD, "username:password");

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);
    if(!$result){
    	die('Error: "' . curl_error($curl) . '" - Code: ' . curl_errno($curl));
    }

    curl_close($curl);

    return $result;
}

?>
