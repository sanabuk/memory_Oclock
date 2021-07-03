<?php
namespace App\Src;

// include environnment constants
include('config.php');

use PDO;

class Database {

	// Use environnment constants to set variables connection
	private $servername = DBHOST;
	private $username = DBUSER;
	private $password = DBPWD;
	private $db_name = DBNAME;
	private $table_name = "scores";

	/**
	 * Connect to DB
	 * @return PDO $conn
	 */
	private function connect(): PDO
	{
		$conn = new PDO("mysql:host=$this->servername;dbname=$this->db_name", $this->username, $this->password);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		return $conn;
	}

	/**
	 * Create DB if not exists
	 * @return void
	 * @throw PDOException
	 */
	public function createDB(): void
	{
		try {
			$conn = new PDO("mysql:host=$this->servername", $this->username, $this->password);
		  	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			$sql = "CREATE DATABASE IF NOT EXISTS ".$this->db_name;
			$conn->exec($sql);
		} catch(PDOException $e) {
		  	throw $e;
		}
		$conn = null;
	}

	/**
	 * Create Table if not exists
	 * @return void
	 * @throw PDOException
	 */
	public function createTable(): void
	{
		try {
		  	$conn = $this->connect();

		  	$sql = "CREATE TABLE IF NOT EXISTS $this->table_name (
		  	id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
		  	player_name VARCHAR(30) NOT NULL,
		  	score INT(50) NOT NULL
		 	) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci";
		 	$conn->exec($sql);
		} catch(PDOException $e) {
		  	throw $e;
		}
		$conn = null;
	}

	/**
	 * Insert score in table 'scores'
	 * @param array $datas
	 * @return void
	 * @throw PDOException
	 */
	public function insert(array $datas): void
	{
		$player_name = $datas['player'];
		$score = $datas['score'];
		try {
			$conn = $this->connect();
			$query = $conn->prepare("INSERT INTO scores (player_name, score)
	  			VALUES (:player, :score)");
			$query->bindParam(":player", $player_name);
			$query->bindParam(":score", $score, PDO::PARAM_INT);
			$query->execute();
		} catch(PDOException $e) {
		  	throw $e;
		}
		$conn = null;
	}

	/**
	 * Get best scores
	 * @param ?int $limit
	 * @return array
	 * @throw PDOException
	 */
	public function getBestScores($limit = 5): array
	{
		try {
		  	$conn = $this->connect();
		  	$query = $conn->prepare("SELECT * FROM $this->table_name ORDER BY score ASC LIMIT :limit");
		  	$query->bindParam(":limit", $limit, PDO::PARAM_INT);
			$query->execute();
			$query->setFetchMode(PDO::FETCH_ASSOC);
		 	return $query->fetchAll();
		} catch(PDOException $e) {
		  	throw $e;
		}
		$conn = null;
	}
}