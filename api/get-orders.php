<?php
header('Content-Type: application/json');
require_once '../database/db.php';

$stmt = $db->query("SELECT * FROM orders ORDER BY id DESC LIMIT 20");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
