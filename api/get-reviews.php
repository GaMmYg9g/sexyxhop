<?php
header('Content-Type: application/json');
require_once '../database/db.php';

$id = $_GET['id'] ?? 0;
$stmt = $db->prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC");
$stmt->execute([$id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
