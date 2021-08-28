<?php 

if($_SERVER['REQUEST_METHOD'] === 'GET'){
    $data = $_GET; 
    $request = $data['request'];
}

if($request === 'permits'){
    echo getPermits($data);
}

function getPermits($data){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/editions');
    // curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8000/editions/" . $id);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [ 
        'Content-Type: application/json', 
        'charset=utf-8'/*, 
        'Authorization: $token'*/ 
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    $result = json_decode($response);
    
    return json_encode($result[0]);
}

?>