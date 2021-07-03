<?php
require "vendor/autoload.php";
require 'vendor/altorouter/altorouter/AltoRouter.php';

$database = new App\Src\Database();
$database->createDB();
$database->createTable();

$router = new AltoRouter();
$router->setBasePath('memory_Oclock/');
$router->map('GET','/',function(){
	echo file_get_contents('app/view/html/view.php');
});
$router->map('GET','/scores', function() use ($database){
	$data = $database->getBestScores();
	header('Content-Type: application/json');
	echo json_encode($data);
});

$router->map('POST','/scores',function() use ($database){
	$database->insert($_POST);
	echo http_response_code(201);
});

$match = $router->match();

// call closure or throw 404 status
if( is_array($match) && is_callable( $match['target'] ) ) {
	call_user_func_array( $match['target'], $match['params'] ); 
} else {
	// no route was matched
	header( $_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
}