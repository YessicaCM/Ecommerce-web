<?php
$conexion = new mysqli("127.0.0.1", "root", "", "logitech", 3307);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$sql = "SELECT 
  p.id,
  p.nombre,
  p.precio,
  p.stock,
  p.categoria_id,
  c.nombre AS categoria
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id";

$resultado = $conexion->query($sql);
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Prueba Productos</title>
  <style>
    body { font-family: Arial; background: #111; color: white; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; border: 1px solid #444; text-align: left; }
    th { background: #222; }
    .ok { color: #00ff88; }
    .error { color: red; }
  </style>
</head>
<body>

<h1>📦 Clasificación de Productos</h1>

<table>
  <tr>
    <th>ID</th>
    <th>Producto</th>
    <th>Precio</th>
    <th>Stock</th>
    <th>Categoria ID</th>
    <th>Categoria (Nombre)</th>
    <th>Estado</th>
  </tr>

<?php while($fila = $resultado->fetch_assoc()): ?>
  <tr>
    <td><?= $fila['id'] ?></td>
    <td><?= $fila['nombre'] ?></td>
    <td>$<?= $fila['precio'] ?></td>
    <td><?= $fila['stock'] ?></td>
    <td><?= $fila['categoria_id'] ?></td>
    <td><?= $fila['categoria'] ?? 'SIN CATEGORÍA' ?></td>

    <td>
      <?php if ($fila['categoria']): ?>
        <span class="ok">✔ Correcto</span>
      <?php else: ?>
        <span class="error">❌ Categoría inválida</span>
      <?php endif; ?>
    </td>
  </tr>
<?php endwhile; ?>

</table>

</body>
</html>