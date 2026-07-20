<?php

require_once __DIR__ . '/_helpers.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');

if (isset($_SESSION['admin'])) {
    echo json_encode([
        'ok' => true,
        'admin' => $_SESSION['admin']
    ]);
} else {
    echo json_encode([
        'ok' => false
    ]);
}

