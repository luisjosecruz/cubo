<?php 

namespace Model;

class DatabaseConnection
{
    private $connect = null;

    public function __construct(){
        $host = getenv('DB_HOST');
        $port = getenv('DB_PORT');
        $data = getenv('DB_DATABASE');
        $user = getenv('DB_USERNAME');
        $pass = getenv('DB_PASSWORD');

        try {
            $this->connect = new \PDO("mysql:host=$host;port=$port;charset=utf8mb4;dbname=$data", $user, $pass);
        } catch (\PDOException $e) {
            exit($e->getMeesage());
        }
    }

    public function getConnection(){
        return $this->connect;
    }
}

?>