<?php 

$URI = $_SERVER['REQUEST_URI'];

switch($URI){
    case '/':
        require_once('includes/head.inc.php');
        require_once('includes/header.inc.php');
        require_once('includes/template.php');
        require_once('includes/footer.inc.php');
        break;
    case '/login':
        require_once('includes/head.inc.php');
        require_once('login.html'); 
        require_once('includes/footer.inc.php');
        break;
}
?>
