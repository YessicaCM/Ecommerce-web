<?php
require_once __DIR__ . '/_helpers.php';

$data = obtenerJson();

$usuario_id = $_SESSION['usuario']['id'] ?? null;

if (!$usuario_id) {
    responder(['ok' => false, 'mensaje' => 'Usuario no autenticado'], 401);
}

$producto_id = $data['producto_id'] ?? null;
$cantidad = $data['cantidad'] ?? 1;

if (!$producto_id) {
    responder(['ok' => false, 'mensaje' => 'Producto inválido'], 400);
}

// Verificar si ya existe
$stmt = $conn->prepare("
    SELECT id, cantidad FROM carrito
    WHERE usuario_id = ? AND producto_id = ?
");

$stmt->bind_param("ii", $usuario_id, $producto_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {

    $nuevaCantidad = $row['cantidad'] + $cantidad;

    $update = $conn->prepare("
        UPDATE carrito SET cantidad = ?
        WHERE id = ?
    ");

    $update->bind_param("ii", $nuevaCantidad, $row['id']);
    $update->execute();

} else {

    $insert = $conn->prepare("
        INSERT INTO carrito (usuario_id, producto_id, cantidad)
        VALUES (?, ?, ?)
    ");

    $insert->bind_param("iii", $usuario_id, $producto_id, $cantidad);
    $insert->execute();
}

responder([
    'ok' => true,
    'mensaje' => 'Producto agregado al carrito'
]);