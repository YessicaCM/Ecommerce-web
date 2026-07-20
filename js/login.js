
async function login() {
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  console.log(user,pass);
  const resp = await fetch('api/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ usuario: user, contrasena: pass })
    
  });

    const text = await resp.text();
    console.log(text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Error en el servidor");
      return;
    }

  if (data.ok) {
    if (data.tipo === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  } else {
    alert(data.mensaje || "Credenciales incorrectas");
  } 
  
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    await login();
  });
});


