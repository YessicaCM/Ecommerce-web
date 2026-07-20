<?php
require_once __DIR__ . '/_helpers.php';

$data = $_POST;

// Obtener datos
$nombre = trim($data['nombre_completo'] ?? '');
$usuario = trim($data['usuario'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if ($nombre === '' || $usuario === '' || $email === '' || $password === '') {
    echo "Todos los campos son obligatorios";
    exit;
}

// Encriptar contraseña
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Verificar usuario duplicado
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo "El usuario ya existe";
    exit;
}

// Insertar usuario
$stmt = $conn->prepare("
    INSERT INTO usuarios (nombre_completo, usuario, email, password, created_at)
    VALUES (?, ?, ?, ?, NOW())
");

$stmt->bind_param("ssss", $nombre, $usuario, $email, $passwordHash);
$stmt->execute();

echo "ok";

header("Location: ../login.html?msg=usuario_creado");
exit;