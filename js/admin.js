let editId = null;
const form = document.getElementById('productForm');
const lista = document.getElementById('listaProductos');



async function obtenerProductos() {
  const resp = await fetch('api/productos.php');
  const data = await resp.json();
  return Array.isArray(data) ? data : data.productos || [];
}
async function cargarCategorias(selectedId = null) {
  const res = await fetch("api/categorias.php");
  const data = await res.json();

  const select = document.getElementById("categoria");

  select.innerHTML = data.categorias.map(c => `
    <option value="${c.id}">${c.nombre}</option>
  `).join("");

  // 👉 seleccionar categoría al editar
  if (selectedId) {
    select.value = selectedId;
  }
}

async function render() {
  const productos = await obtenerProductos();
  lista.innerHTML = '';

  productos.forEach((p) => {
    lista.innerHTML += `
  <div class="bg-slate-900 rounded-xl p-4 border border-slate-700">
    <img src="assets/${p.imagen}" alt="${p.nombre}" class="w-full h-40 object-cover rounded mb-3">

    <h3 class="text-lg font-bold">${p.nombre}</h3>

    <p class="text-cyan-400 font-semibold mb-2">
      $${parseFloat(p.precio).toFixed(2)}
    </p>

    <p class="text-sm text-slate-300 mb-3">${p.descripcion}</p>

    <p class="text-xs text-slate-400 mb-2">
      Categoría: ${p.categoria}
    </p>

    <p class="text-sm font-semibold mb-3 ${
      p.stock == 0 ? 'text-red-500' : 'text-green-400'
    }">
      ${p.stock == 0 ? 'Agotado' : `Stock: ${p.stock}`}
    </p>

    <div class="flex gap-2">
      <button onclick="editar(${p.id})" class="bg-blue-600 px-3 py-1 rounded">Editar</button>
      <button onclick="eliminarProducto(${p.id})" class="bg-red-600 px-3 py-1 rounded">Eliminar</button>
    </div>
  </div>
`;
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append('nombre', document.getElementById('nombre').value);
  formData.append('precio', document.getElementById('precio').value);
  formData.append('descripcion', document.getElementById('descripcion').value);
  formData.append('categoria', document.getElementById('categoria').value);
  formData.append('stock', document.getElementById('stock').value);
  const file = document.getElementById('imagen').files[0];
  if (file) {
    formData.append('imagen', file);
  }

 let url = 'api/productos.php';
  let method = 'POST';

  if (editId) {
    console.log("EDITANDO ID:", editId);

    formData.append("id", String(editId));
    formData.append("_method", "PUT"); // 👈 CLAVE
}

  const resp = await fetch(url, {
    method,
    body: method === 'POST' ? formData : JSON.stringify({
      nombre: document.getElementById('nombre').value,
      precio: document.getElementById('precio').value,
      descripcion: document.getElementById('descripcion').value,
      imagen: document.getElementById('imagen').value,
      categoria: document.getElementById('categoria').value,
      stock: document.getElementById('stock').value
    }),
    headers: method === 'PUT'
      ? { 'Content-Type': 'application/json' }
      : undefined
  });

  const text = await resp.text();
console.log("RESPUESTA RAW:", text);

let data;

try {
  data = JSON.parse(text);
} catch (e) {
  alert("Error del servidor (no JSON)");
  return;
}

if (data.ok) {
  showToast("✅ Producto guardado correctamente");
} else {
  alert("❌ " + data.mensaje);
}

  if (data.ok) {
    form.reset();
    editId = null;
    render();
  }
});
 window.editar = async function editar(id) {
  const resp = await fetch(`api/producto.php?id=${id}`);
  const data = await resp.json();
  if (!data.ok) return alert(data.mensaje);

  const p = data.producto;
  document.getElementById('nombre').value = p.nombre;
  document.getElementById('precio').value = p.precio;
  document.getElementById('descripcion').value = p.descripcion;
  document.getElementById('imagen').value = "";
  document.getElementById("previewImagen").src = "assets/" + p.imagen;
  document.getElementById('stock').value = p.stock;
  const categoria = document.getElementById('categoria');
  if (categoria) categoria.value = p.categoria_id;
  await cargarCategorias(p.categoria_id);
  editId = p.id;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
}

async function eliminarProducto(id) {
  if (!confirm('¿Desea eliminar este producto?')) return;

  const resp = await fetch(`api/producto.php?id=${id}`, { method: 'DELETE' });
  const data = await resp.json();
  alert(data.mensaje);
  if (data.ok) render();
}



document.addEventListener('DOMContentLoaded', async () => {
  cargarCategorias();
  await render();
});
