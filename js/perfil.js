async function cargarPerfil() {
  const resp = await fetch('api/me.php', { credentials: 'include' });
  const data = await resp.json();

  if (!data.ok) {
    window.location.href = "login.html";
    return;
  }

  const user = data.usuario;

  document.getElementById("nombre").textContent = user.nombre;
  document.getElementById("usuario").textContent = user.usuario;
  document.getElementById("email").textContent = user.email;
  document.getElementById("fecha").textContent = user.created_at;

  if (data.tipo === 'admin') {
    document.getElementById("adminBtn").innerHTML = `
      <button onclick="window.location.href='admin.html'" class="mt-6 w-full bg-cyan-600 py-2 rounded">
        Panel de Administración
      </button>
    `;
  }
}

async function logout() {
  await fetch('api/logout.php');
  window.location.href = "login.html";
}

cargarPerfil();
document.getElementById("logoutBtn").addEventListener("click", logout);