<?php
require_once __DIR__ . '/_helpers.php';

$data = obtenerJson();

$usuario_id = $_SESSION['usuario']['id'] ?? null;

if (!$usuario_id) {
    responder([
        'ok' => false,
        'mensaje' => 'Usuario no autenticado'
    ], 401);
}

$nombre = trim($data['nombre'] ?? '');
$apellido = trim($data['apellido'] ?? '');
$correo = trim($data['correo'] ?? '');
$telefono = trim($data['telefono'] ?? '');
$direccion = trim($data['direccion'] ?? '');
$ciudad = trim($data['ciudad'] ?? '');
$provincia = trim($data['provincia'] ?? '');
$codigo_postal = trim($data['codigo_postal'] ?? '');
$metodo_pago = trim($data['metodo_pago'] ?? '');

if (
    $nombre === '' ||
    $apellido === '' ||
    $correo === '' ||
    $telefono === '' ||
    $direccion === '' ||
    $ciudad === '' ||
    $provincia === '' ||
    $codigo_postal === '' ||
    $metodo_pago === ''
) {
    responder([
        'ok' => false,
        'mensaje' => 'Todos los campos del checkout son obligatorios'
    ], 400);
}

$carritoStmt = $conn->prepare("
    SELECT c.producto_id, c.cantidad, p.precio, p.stock
    FROM carrito c
    INNER JOIN productos p ON c.producto_id = p.id
    WHERE c.usuario_id = ?
");

if (!$carritoStmt) {
    responder([
        'ok' => false,
        'mensaje' => 'Error al preparar consulta del carrito: ' . $conn->error
    ], 500);
}

$carritoStmt->bind_param("i", $usuario_id);
$carritoStmt->execute();
$carritoResult = $carritoStmt->get_result();

$items = [];
$total = 0;

while ($row = $carritoResult->fetch_assoc()) {
    $cantidad = (int)$row['cantidad'];
    $precio = (float)$row['precio'];
    $stock = (int)$row['stock'];

    if ($cantidad <= 0) {
        continue;
    }

    if ($stock < $cantidad) {
        responder([
            'ok' => false,
            'mensaje' => 'No hay stock suficiente para uno de los productos del carrito'
        ], 400);
    }

    $row['precio'] = $precio;
    $row['cantidad'] = $cantidad;
    $items[] = $row;

    $total += ($precio * $cantidad);
}

if (count($items) === 0) {
    responder([
        'ok' => false,
        'mensaje' => 'El carrito está vacío'
    ], 400);
}

$conn->begin_transaction();

try {
    // 1. Guardar pedido
    $pedidoStmt = $conn->prepare("
        INSERT INTO pedidos (
            usuario_id,
            total,
            nombre,
            apellido,
            correo,
            telefono,
            direccion,
            ciudad,
            provincia,
            codigo_postal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$pedidoStmt) {
        throw new Exception('Error al preparar pedido: ' . $conn->error);
    }

    $pedidoStmt->bind_param(
        "idssssssss",
        $usuario_id,
        $total,
        $nombre,
        $apellido,
        $correo,
        $telefono,
        $direccion,
        $ciudad,
        $provincia,
        $codigo_postal
    );

    if (!$pedidoStmt->execute()) {
        throw new Exception('Error al guardar pedido: ' . $pedidoStmt->error);
    }

    $pedido_id = $conn->insert_id;

    // 2. Guardar detalle del pedido
    $detalleStmt = $conn->prepare("
        INSERT INTO detalle_pedido (
            pedido_id,
            producto_id,
            cantidad,
            precio
        )
        VALUES (?, ?, ?, ?)
    ");

    if (!$detalleStmt) {
        throw new Exception('Error al preparar detalle_pedido: ' . $conn->error);
    }

    // 3. Actualizar stock
    $stockStmt = $conn->prepare("
        UPDATE productos
        SET stock = stock - ?
        WHERE id = ? AND stock >= ?
    ");

    if (!$stockStmt) {
        throw new Exception('Error al preparar actualización de stock: ' . $conn->error);
    }

    foreach ($items as $item) {
        $producto_id = (int)$item['producto_id'];
        $cantidad = (int)$item['cantidad'];
        $precio = (float)$item['precio'];

        $detalleStmt->bind_param("iiid", $pedido_id, $producto_id, $cantidad, $precio);

        if (!$detalleStmt->execute()) {
            throw new Exception('Error al guardar detalle del pedido: ' . $detalleStmt->error);
        }

        $stockStmt->bind_param("iii", $cantidad, $producto_id, $cantidad);

        if (!$stockStmt->execute()) {
            throw new Exception('Error al actualizar stock: ' . $stockStmt->error);
        }

        if ($stockStmt->affected_rows === 0) {
            throw new Exception('Stock insuficiente para el producto ID ' . $producto_id);
        }
    }

    // 4. Guardar pago
    $estado_pago = 'completado';

    $pagoStmt = $conn->prepare("
        INSERT INTO pagos (
            pedido_id,
            metodo,
            estado
        )
        VALUES (?, ?, ?)
    ");

    if (!$pagoStmt) {
        throw new Exception('Error al preparar pago: ' . $conn->error);
    }

    $pagoStmt->bind_param("iss", $pedido_id, $metodo_pago, $estado_pago);

    if (!$pagoStmt->execute()) {
        throw new Exception('Error al guardar pago: ' . $pagoStmt->error);
    }

    // 5. Limpiar carrito
    $deleteStmt = $conn->prepare("
        DELETE FROM carrito
        WHERE usuario_id = ?
    ");

    if (!$deleteStmt) {
        throw new Exception('Error al preparar limpieza de carrito: ' . $conn->error);
    }

    $deleteStmt->bind_param("i", $usuario_id);

    if (!$deleteStmt->execute()) {
        throw new Exception('Error al limpiar carrito: ' . $deleteStmt->error);
    }

    $conn->commit();

    responder([
        'ok' => true,
        'mensaje' => 'Compra realizada correctamente',
        'pedido_id' => $pedido_id
    ]);

} catch (Exception $e) {
    $conn->rollback();

    responder([
        'ok' => false,
        'mensaje' => $e->getMessage()
    ], 500);
}