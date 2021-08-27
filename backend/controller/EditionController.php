<?php 

namespace Controller;

use Model\Editions;

class EditionController
{
    private $con;
    private $requestMethod;
    private $editionId;

    private $editionController;

    public function __construct($con, $requestMethod, $editionId){
        $this->con = $con;
        $this->requestMethod = $requestMethod;
        $this->editionId = $editionId;

        $this->editionController = new Editions($con);
    }

    public function processRequest(){
        switch ($this->requestMethod) {
            case 'GET':
                if ($this->editionId) {
                    $response = $this->getEdition($this->editionId);
                }else{
                    $response = $this->getAllEditions();
                }
                break;

            case 'POST':
                $response = $this->createEditionFromRequest();
                break;
            
            case 'PUT':
                $response = $this->updateEditionFromRequest($this->editionId);
                break;

            case 'DELETE':
                $response = $this->deleteEdition($this->editionId);
                break;

            default:
                $response = $this->notFoundResponse();
                break;
        }
        header($response['status_code_header']);
        if ($response['body']) {
            echo $response['body'];
        }
    }

    private function getAllEditions(){
        $result = $this->editionController->findAll();
        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = json_encode($result);
        return $response;
    }

    private function getEdition($editionId){
        $result = $this->editionController->find($editionId);
        if (!$result) {
            return $this->notFoundResponse();
        }
        $response['status_code_header'] ='HTTP/1.1 200 OK';
        $response['body'] = json_encode($result);
        return $response;
    }

    private function createEditionFromRequest($editionId){
        $input = (array) json_decode(file_get_contents('php://input'), TRUE);
        if (!$this->validateEdition($input)) {
            return $this->unprocessableEntityResponse();
        }
        $this->editionController->insert($input);
        $response['status_code_header'] = 'HTTP/1.1 201 Created';
        $response['body'] = null;
        return $response;
    }

    private function updateEditionFromRequest($editionId){
        $result = $this->editionController->find($editionId);
        if(!$result){
            return $this->notFoundResponse();
        }
        $input = (array) json_decode(file_get_contents('php://input'), TRUE);
        if(!$this->validateEdition($input)){
            return $this->unprocessableEntityResponse();
        }
        $this->editionController->update($editionId, $input);
        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = null;
        return $response;
    }

    private function deleteEdition($editionId){
        $result = $this->editionController->find($editionId);
        if(!result){
            return $this->notFoundResponse();
        }
        $this->editionController->delete($editionId);
        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = null;
        return $response;
    }

    private function unprocessableEntityResponse(){
        $response['status_code_header'] = 'HTTP/1.1 442 Unprocessable Entity';
        $response['body'] = json_encode([
            'error' => 'Invalid input'
        ]);
        return $response;
    }

    private function notFoundResponse(){
        $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
        $response['body'] = null;
        return $response;
    }
}


?>