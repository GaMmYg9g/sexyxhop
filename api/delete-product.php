<?php
header('Content-Type: application/json');
require_once '../database/db.php';

$id = $_GET['id'] ?? 0;
$stmt = $db->prepare("DELETE FROM products WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(['success' => true]);
?>
