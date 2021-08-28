<?php 
require_once dirname('__FILE__') . '/../bootstrap.php';
use Controller\EditionController;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

$allowedRoutes = ['editions','sheets','pages','permits'];

if (!in_array($uri[1], $allowedRoutes)) {
    header("HTTP/1.1 404 Not Found");
    exit();
}

$requestMethod = $_SERVER["REQUEST_METHOD"];

switch ($uri[1]) {
    case 'editions':
        $editionId = null;
        if(isset($uri[2])) $editionId = (int) $uri[2];
        $controller = new EditionController($con, $requestMethod, $editionId);
        $controller->processRequest();
        break;
    case 'permits':
        
        break;
    
    default:
        # code...
        break;
}

?>