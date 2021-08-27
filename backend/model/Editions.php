<?php 

namespace Model;

class Editions
{
    private $con = null;

    public function __construct($con){
        $this->con = $con;
    }

    public function findAll(){
        $statement = "SELECT * FROM ediciones ORDER BY id_edicion DESC LIMIT 5";

        try {
            $statement = $this->con->query($statement);
            $result = $statement->fetchAll(\PDO::FETCH_ASSOC);

            return $result;
        } catch (\PDOException $e) {
            exit($e->getMeesage());
        }
    }

    public function find($id){
        $statement = "SELECT * FROM ediciones WHERE id_edicion = ? LIMIT 10";

        try {
            $statement = $this->con->prepare($statement);
            $statement->execute(array($id));
            $result = $statement->fetchAll(\PDO::FETCH_ASSOC);

            return $result;
        } catch (\PDOException $e) {
            exit($e->getMeesage());
        }
    }

    public function insert(Array $input){
        $statement = "
            INSERT INTO ediciones
                (id_edicion, id_empresa, edTipo, edDescripcion, fecha_edicion, numeracion, tiros, paginas, tiraje, estado) 
            VALUES
                (null, 1, :tipo, 'test', '2021-08-26', 20000, 2, :pages, :tiraje, :status);
        ";

        try {
            $statement = $this->con->prepare($statement);
            $statement->execute(array(
                'tipo' => $input['tipo'],
                'pages' => $input['pages'],
                'tiraje' => $input['tiraje'],
                'status' => $input['status']
            ));

            return $statement->rowCount();
        } catch (\PDOException $e) {
            exit($e->getMeesage());
        }
    }

    public function update($id, Array $input){
        $statement = "
            UPDATE ediciones 
            SET
                tiraje = :tiraje,
                pages = :pages,
                status = :status
            WHERE id_edicion = :id;
        ";

        try {
            $statement = $this->con->prepare($statement);
            $statement->execute(array(
                'id' => (int) $id,
                'tiraje' => $input['tiraje'],
                'pages' => $input['pages'],
                'status' => $input['status']
            ));

            return $statement->rowCount();
        } catch (\PDOException $e) {
            exit($e->getMeesage());
        }
    }
}

?>