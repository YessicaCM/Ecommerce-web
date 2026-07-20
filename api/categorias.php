<?php

require_once __DIR__ . '/_helpers.php';

$sql = "SELECT id, nombre FROM categorias";
$res = $conn->query($sql);

$categorias = [];

while ($fila = $res->fetch_assoc()) {
    $categorias[] = [
        "id" => (int)$fila["id"],
        "nombre" => $fila["nombre"]
    ];
}

echo json_encode([
    "ok" => true,
    "categorias" => $categorias
]);