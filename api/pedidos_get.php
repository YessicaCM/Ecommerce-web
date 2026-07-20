<?php
require_once __DIR__ . '/_helpers.php';

$usuario_id = $_SESSION['usuario']['id'] ?? null;

if (!$usuario_id) {
    responder(['ok' => false, 'mensaje' => 'No autenticado'], 401);
}

// traer pedidos
$stmt = $conn->prepare("
    SELECT * FROM pedidos
    WHERE usuario_id = ?
    ORDER BY id DESC
");

$stmt->bind_param("i", $usuario_id);
$stmt->execute();

$result = $stmt->get_result();

$pedidos = [];

while ($pedido = $result->fetch_assoc()) {

    // traer productos de cada pedido
    $detalleStmt = $conn->prepare("
        SELECT d.*, p.nombre, p.imagen
        FROM detalle_pedido d
        JOIN productos p ON d.producto_id = p.id
        WHERE d.pedido_id = ?
    ");

    $detalleStmt->bind_param("i", $pedido['id']);
    $detalleStmt->execute();

    $detalleResult = $detalleStmt->get_result();

    $productos = [];

    while ($item = $detalleResult->fetch_assoc()) {
        $productos[] = $item;
    }

    $pedido['productos'] = $productos;

    $pedidos[] = $pedido;
}

responder([
    'ok' => true,
    'pedidos' => $pedidos
]);