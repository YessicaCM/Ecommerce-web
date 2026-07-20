<?php
require_once __DIR__ . '/_helpers.php';

$data = obtenerJson();

$usuario_id = $_SESSION['usuario']['id'] ?? null;
$producto_id = $data['producto_id'] ?? null;
$cantidad = $data['cantidad'] ?? 1;

if (!$usuario_id || !$producto_id) {
    responder(['ok' => false], 400);
}

$stmt = $conn->prepare("
    UPDATE carrito
    SET cantidad = ?
    WHERE usuario_id = ? AND producto_id = ?
");

$stmt->bind_param("iii", $cantidad, $usuario_id, $producto_id);
$stmt->execute();

responder(['ok' => true]);