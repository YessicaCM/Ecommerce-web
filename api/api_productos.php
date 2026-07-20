<?php
include("config/conexion.php");

$sql = "SELECT * FROM productos";
$resultado = $conn->query($sql);

$productos = [];

while ($fila = $resultado->fetch_assoc()) {
    $productos[] = $fila;
}

header('Content-Type: application/json');
echo json_encode($productos);
?>
