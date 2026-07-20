<?php

require_once __DIR__ . '/_helpers.php';

$data = obtenerJson();
$usuario = trim($data['usuario'] ?? '');
$contrasena = trim($data['contrasena'] ?? '');

if ($usuario === '' || $contrasena === '') {
    responder(['ok' => false, 'mensaje' => 'Complete usuario y contraseña'], 400);
}

// 1. BUSCAR EN ADMINS
$sql = "SELECT id, usuario, contrasena FROM admins WHERE usuario = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $usuario);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();

if ($admin && (
    password_verify($contrasena, $admin['contrasena']) )) {
    $_SESSION['admin'] = [
        'id' => (int)$admin['id'],
        'usuario' => $admin['usuario']
    ];

    responder([
        'ok' => true,
        'tipo' => 'admin',
        'mensaje' => 'Login admin correcto'
    ]);
    exit;
}

// 2. BUSCAR EN USUARIOS
$sql = "SELECT id, usuario, nombre_completo, email, password, created_at 
FROM usuarios 
WHERE usuario = ? 
LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $usuario);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($contrasena, $user['password'])) {
    $_SESSION['usuario'] = [
        'id' => (int)$user['id'],
        'usuario' => $user['usuario'],
        'nombre' => $user ['nombre_completo'],
        'email' => $user ['email'],
        'created_at' => $user ['created_at']
    ];

    responder([
        'ok' => true,
        'tipo' => 'usuario',
        'mensaje' => 'Login usuario correcto'
    ]);
    exit;
}

// ❌ SI NO COINCIDE NADA
responder(['ok' => false, 'mensaje' => 'Credenciales incorrectas'], 401);