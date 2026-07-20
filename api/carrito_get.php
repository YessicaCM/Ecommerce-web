<?php
require_once __DIR__ . '/_helpers.php';

$usuario_id = $_SESSION['usuario']['id'] ?? null;

if (!$usuario_id) {
    responder(['ok' => false, 'mensaje' => 'No autenticado'], 401);
}

$stmt = $conn->prepare("
    SELECT c.producto_id, c.cantidad,
           p.nombre, p.precio, p.imagen, p.descripcion
    FROM carrito c
    JOIN productos p ON c.producto_id = p.id
    WHERE c.usuario_id = ?
");

$stmt->bind_param("i", $usuario_id);
$stmt->execute();

$result = $stmt->get_result();

$carrito = [];

while ($row = $result->fetch_assoc()) {
    $carrito[] = [
        "id" => (string)$row['producto_id'],
        "name" => $row['nombre'],
        "price" => (float)$row['precio'],
        "image" => $row['imagen'],
        "description" => $row['descripcion'],
        "quantity" => (int)$row['cantidad']
    ];
}

responder([
    'ok' => true,
    'carrito' => $carrito
]);