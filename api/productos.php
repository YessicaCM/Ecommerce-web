<?php

require_once __DIR__ . '/_helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
  p.id,
  p.nombre,
  p.precio,
  p.descripcion,
  p.imagen,
  p.stock,
  p.categoria_id,
  c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id";
    $res = $conn->query($sql);
    $productos = [];
    while ($fila = $res->fetch_assoc()) {
        $fila['id'] = (int)$fila['id'];
        $fila['price'] = (float)$fila['precio'];
        $fila['name'] = $fila['nombre'];
        $fila['image'] = $fila['imagen'];
        $fila['category'] = $fila['categoria'];
        $productos[] = $fila;
    }
    responder(['ok' => true, 'productos' => $productos]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

  $id = isset($_POST['id']) ? intval($_POST['id']) : null;

  $nombre = $_POST['nombre'];
  $precio = $_POST['precio'];
  $descripcion = $_POST['descripcion'];
  $categoria = $_POST['categoria'];
  $stock = $_POST['stock'];

  $imagenNombre = null;

  // Manejo de imagen
  if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
    $nombreArchivo = time() . "_" . basename($_FILES['imagen']['name']);
    $rutaDestino = "../assets/" . $nombreArchivo;

    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino)) {
      $imagenNombre = $nombreArchivo;
    }
  }

  // 🔥 SI EXISTE ID → UPDATE
  if ($id) {

    if ($imagenNombre) {
      $sql = "UPDATE productos 
              SET nombre=?, precio=?, descripcion=?, imagen=?, categoria_id=?, stock=? 
              WHERE id=?";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("sdssiii", $nombre, $precio, $descripcion, $imagenNombre, $categoria, $stock, $id);
    } else {
      $sql = "UPDATE productos 
              SET nombre=?, precio=?, descripcion=?, categoria_id=?, stock=? 
              WHERE id=?";
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("sdssii", $nombre, $precio, $descripcion, $categoria, $stock, $id);
    }

    $stmt->execute();

    echo json_encode(["ok" => true, "mensaje" => "Producto actualizado"]);
    exit;
  }

  // 🔥 SI NO → INSERT
  $sql = "INSERT INTO productos (nombre, precio, descripcion, imagen, categoria_id, stock)
          VALUES (?, ?, ?, ?, ?, ?)";

  $stmt = $conn->prepare($sql);
  $stmt->bind_param("sdssii", $nombre, $precio, $descripcion, $imagenNombre, $categoria, $stock);
  $stmt->execute();

  echo json_encode(["ok" => true, "mensaje" => "Producto creado"]);
  exit;
}

responder(['ok' => false, 'mensaje' => 'Método no permitido'], 405);
