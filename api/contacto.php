<?php
require_once __DIR__ . '/_helpers.php';

$data = obtenerJson();

$usuario = $_SESSION['usuario']['usuario'] ?? 'invitado';
$nombre  = trim($data['nombre'] ?? '');
$email   = trim($data['email'] ?? '');
$asunto  = trim($data['asunto'] ?? '');
$mensaje = trim($data['mensaje'] ?? '');

if ($nombre === '' || $email === '' || $asunto === '' || $mensaje === '') {
    responder([
        'ok' => false,
        'mensaje' => 'Campos vacíos'
    ], 400);
}

$stmt = $conn->prepare("
    INSERT INTO contactos (nombre, email, asunto, mensaje, usuario)
    VALUES (?, ?, ?, ?, ?)
");

if (!$stmt) {
    responder([
        'ok' => false,
        'mensaje' => 'Error al preparar la consulta: ' . $conn->error
    ], 500);
}

$stmt->bind_param("sssss", $nombre, $email, $asunto, $mensaje, $usuario);

if (!$stmt->execute()) {
    responder([
        'ok' => false,
        'mensaje' => 'Error al ejecutar la consulta: ' . $stmt->error
    ], 500);
}

$stmt->close();

responder([
    'ok' => true,
    'mensaje' => 'Guardado correctamente'
]);