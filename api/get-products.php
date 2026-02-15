<?php
header('Content-Type: application/json');
require_once '../database/db.php';

$id = $_GET['id'] ?? 0;

if ($id) {
    $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
} else {
    $stmt = $db->query("SELECT * FROM products ORDER BY id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
