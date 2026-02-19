<?php
require_once 'db_config.php';

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ── Read & sanitize input ──────────────────
$raw = json_decode(file_get_contents('php://input'), true);

// Support both JSON body and form-data
$from_name  = trim($raw['from_name']  ?? $_POST['from_name']  ?? '');
$from_email = trim($raw['from_email'] ?? $_POST['from_email'] ?? '');
$subject    = trim($raw['subject']    ?? $_POST['subject']    ?? '');
$message    = trim($raw['message']    ?? $_POST['message']    ?? '');

// ── Validate ───────────────────────────────
$errors = [];

if (empty($from_name))              $errors[] = 'Name is required.';
if (empty($from_email))             $errors[] = 'Email is required.';
elseif (!filter_var($from_email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email format.';
if (empty($subject))                $errors[] = 'Subject is required.';
if (empty($message))                $errors[] = 'Message is required.';
elseif (strlen($message) < 10)      $errors[] = 'Message must be at least 10 characters.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ── Insert into database ───────────────────
try {
    $pdo  = getDB();
    $stmt = $pdo->prepare(
        'INSERT INTO contact_messages (from_name, from_email, subject, message)
         VALUES (:name, :email, :subject, :message)'
    );
    $stmt->execute([
        ':name'    => htmlspecialchars($from_name,  ENT_QUOTES, 'UTF-8'),
        ':email'   => $from_email,
        ':subject' => htmlspecialchars($subject,    ENT_QUOTES, 'UTF-8'),
        ':message' => htmlspecialchars($message,    ENT_QUOTES, 'UTF-8'),
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Message received! I\'ll get back to you soon.',
        'id'      => $pdo->lastInsertId(),
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save message. Please try again.']);
}
?>