<?php
$host = "localhost";
$usuario = "root";
$password = "";
$base_datos = "logitech";

$conn = new mysqli($host, $usuario, $password, $base_datos);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die("❌ Error de conexión: " . $conn->connect_error);
} else {
    if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
}
?>