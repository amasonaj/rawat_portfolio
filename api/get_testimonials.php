<?php
require_once 'db_config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $pdo  = getDB();
    $stmt = $pdo->query(
        'SELECT id, name, role, message, rating, submitted_at
         FROM testimonials
         WHERE is_approved = 1
         ORDER BY submitted_at DESC
         LIMIT 20'
    );
    $testimonials = $stmt->fetchAll();

    echo json_encode([
        'success'      => true,
        'testimonials' => $testimonials,
        'count'        => count($testimonials),
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load testimonials.']);
}
?>