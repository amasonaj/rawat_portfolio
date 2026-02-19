<?php
require_once 'db_config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ── Read input ─────────────────────────────
$raw = json_decode(file_get_contents('php://input'), true);

$name    = trim($raw['name']    ?? $_POST['name']    ?? '');
$role    = trim($raw['role']    ?? $_POST['role']    ?? '');
$message = trim($raw['message'] ?? $_POST['message'] ?? '');
$rating  = intval($raw['rating'] ?? $_POST['rating'] ?? 0);

// ── Validate ───────────────────────────────
$errors = [];

if (empty($name))                   $errors[] = 'Name is required.';
if (empty($role))                   $errors[] = 'Role is required.';
if (empty($message))                $errors[] = 'Message is required.';
elseif (strlen($message) < 15)      $errors[] = 'Message must be at least 15 characters.';
if ($rating < 1 || $rating > 5)     $errors[] = 'Rating must be between 1 and 5.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ── Insert ─────────────────────────────────
try {
    $pdo  = getDB();
    $stmt = $pdo->prepare(
        'INSERT INTO testimonials (name, role, message, rating)
         VALUES (:name, :role, :message, :rating)'
    );
    $stmt->execute([
        ':name'    => htmlspecialchars($name,    ENT_QUOTES, 'UTF-8'),
        ':role'    => htmlspecialchars($role,    ENT_QUOTES, 'UTF-8'),
        ':message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8'),
        ':rating'  => $rating,
    ]);

    $newId = $pdo->lastInsertId();

    // Return the newly created testimonial so JS can render it immediately
    echo json_encode([
        'success'      => true,
        'message'      => 'Thank you! Your testimonial has been posted.',
        'testimonial'  => [
            'id'           => $newId,
            'name'         => htmlspecialchars($name),
            'role'         => htmlspecialchars($role),
            'message'      => htmlspecialchars($message),
            'rating'       => $rating,
            'submitted_at' => date('Y-m-d H:i:s'),
        ],
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save testimonial. Please try again.']);
}
?>