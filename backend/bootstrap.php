<?php 
require dirname(__FILE__) . "/../vendor/autoload.php"; 

use Config\Env;
use Model\DatabaseConnection;

(new Env())->load();

$con = (new DatabaseConnection())->getConnection();

?>