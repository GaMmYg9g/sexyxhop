<?php
header('Content-Type: application/json');
require_once '../database/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->execute([$data['status'], $data['id']]);

echo json_encode(['success' => true]);
?>
