<?php
include("conexion.php");

if ($conn) {
    echo "✅ Conexión exitosa";
} else {
    echo "❌ Error de conexión";
}
?>
