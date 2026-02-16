<?php
header('Content-Type: application/json');
require_once '../database/db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id'])) {
    $stmt = $db->prepare("INSERT INTO products (name, price, stock, category, image, description, commission_type, commission_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'],
        $data['price'],
        $data['stock'],
        $data['category'],
        $data['image'] ?: 'https://via.placeholder.com/300x400',
        $data['description'],
        $data['commission_type'],
        $data['commission_value']
    ]);
} else {
    $stmt = $db->prepare("UPDATE products SET name=?, price=?, stock=?, category=?, image=?, description=?, commission_type=?, commission_value=? WHERE id=?");
    $stmt->execute([
        $data['name'],
        $data['price'],
        $data['stock'],
        $data['category'],
        $data['image'],
        $data['description'],
        $data['commission_type'],
        $data['commission_value'],
        $data['id']
    ]);
}

echo json_encode(['success' => true]);
?>
