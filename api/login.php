<?php
header('Content-Type: application/json');
session_start();

$data = json_decode(file_get_contents('php://input'), true);

if ($data['email'] === 'admin@tienda.com' && $data['password'] === 'admin123') {
    $_SESSION['admin'] = true;
    echo json_encode(['success' => true, 'name' => 'Admin', 'token' => md5(time())]);
} else {
    echo json_encode(['success' => false]);
}
?>
