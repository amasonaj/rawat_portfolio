<?php

define('DB_HOST', 'sql105.infinityfree.com');
define('DB_USER', 'if0_41206265'); 
define('DB_PASS', 'amasonaj31');      
define('DB_NAME', 'if0_41206265_rawat_portfolio');
define('DB_CHARSET', 'utf8mb4');

//default
// define('DB_HOST', 'localhost');
// define('DB_USER', 'root');      
// define('DB_PASS', '');         
// define('DB_NAME', 'rawat_portfolio');
// define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit;
        }
    }
    return $pdo;
}

// Allow requests from same origin (XAMPP local)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>