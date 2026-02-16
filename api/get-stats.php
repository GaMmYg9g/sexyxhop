<?php
header('Content-Type: application/json');
require_once '../database/db.php';

$stats = [
    'products' => $db->query("SELECT COUNT(*) FROM products")->fetchColumn(),
    'orders' => $db->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
    'users' => $db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    'low_stock' => $db->query("SELECT COUNT(*) FROM products WHERE stock < 5")->fetchColumn()
];

echo json_encode($stats);
?>
