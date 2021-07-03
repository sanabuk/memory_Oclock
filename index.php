<?php
require "vendor/autoload.php";
require 'vendor/altorouter/altorouter/AltoRouter.php';

include('config.php');

$database = new App\Src\Database();
$database->createDB();
$database->createTable();

$router = new AltoRouter();
$router->setBasePath(BASEPATH);
$router->setBasePath('memory_Oclock/');

/**
 * Route de base permettant d'afficher l'écran du jeu
 */
$router->map('GET','/',function(){
	echo file_get_contents('app/view/html/view.html');
});

/**
 * Route permettant de récupérer les meilleurs scores
 */
$router->map('GET','/scores', function() use ($database){
	$data = $database->getBestScores();
	header('Content-Type: application/json');
	echo json_encode($data);
});

/**
 * Route permettant de persister le score du joueur si il a gagné
 */
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
