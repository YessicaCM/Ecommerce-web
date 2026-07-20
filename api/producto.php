<?php
require_once __DIR__ . '/_helpers.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    responder(['ok' => false, 'mensaje' => 'ID inválido'], 400);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("
        SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.descripcion,
        p.imagen,
        p.stock,
        c.nombre AS categoria,
        p.categoria_id
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
        LIMIT 1
        ");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $producto = $res->fetch_assoc();

    if (!$producto) responder(['ok' => false, 'mensaje' => 'Producto no encontrado'], 404);

    responder(['ok' => true, 'producto' => $producto]);
}

protegerAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = obtenerJson();
    $nombre = trim($data['nombre'] ?? '');
    $precio = (float)($data['precio'] ?? 0);
    $descripcion = trim($data['descripcion'] ?? '');
    $imagen = trim($data['imagen'] ?? '');
    $categoria = trim($data['categoria'] ?? 'general');
    $stock = (int)($data['stock'] ?? 0);

    if ($nombre === '' || $descripcion === '' || $imagen === '') {
        responder(['ok' => false, 'mensaje' => 'Todos los campos son obligatorios'], 400);
        exit;
    }

    $stmt = $conn->prepare("UPDATE productos 
        SET nombre = ?, precio = ?, descripcion = ?, imagen = ?, categoria_id = ?, stock = ? 
        WHERE id = ?");
    $stmt->bind_param('sdssiii', $nombre, $precio, $descripcion, $imagen, $categoria, $stock, $id);
    $stmt->execute();

    responder(['ok' => true, 'mensaje' => 'Producto actualizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

  $id = $_POST['id'] ?? null;

  if ($id) {
    // 🔄 UPDATE
    $stmt = $conn->prepare("
      UPDATE productos 
      SET nombre=?, precio=?, descripcion=?, categoria_id=?, stock=?
      WHERE id=?
    ");

    $stmt->bind_param("sdssii", $nombre, $precio, $descripcion, $categoria, $stock, $id);
    $stmt->execute();

    responder(['ok' => true, 'mensaje' => 'Producto actualizado']);
    exit;
  }

}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    responder(['ok' => true, 'mensaje' => 'Producto eliminado']);
}

responder(['ok' => false, 'mensaje' => 'Método no permitido'], 405);
