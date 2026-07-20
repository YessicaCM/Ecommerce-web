<?php 
require_once __DIR__ . '/_helpers.php';
header('Content-Type: application/json');


if (isset($_SESSION['usuario'])) {
    echo json_encode([
        'ok' => true,
        'usuario' => $_SESSION['usuario']
    ]);
} else if (isset($_SESSION['admin'])) {
    echo json_encode([
        'ok' => true,
        'usuario' => $_SESSION['admin'],
        'tipo' => 'admin'
    ]);
} else {
    echo json_encode(['ok' => false]);
}
