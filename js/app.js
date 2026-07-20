import { categories, products } from './data.js';

let dbProducts = [];

async function cargarProductosDB() {
  try {
    const resp = await fetch('api/productos.php');
    const data = await resp.json();

    const productos = Array.isArray(data) ? data : (data.productos || []);

    dbProducts = productos.map(p => ({
      id: String(p.id),
      name: p.nombre ?? p.name,
      price: parseFloat(p.precio ?? p.price ?? 0),
      image: p.imagen ?? p.image,
      category: p.categoria ?? p.category ?? 'general',
      categoria_id: String(p.categoria_id ?? ''),
      stock: parseInt(p.stock ?? 0),
      description: p.descripcion ?? ''
    }));
  } catch (e) {
    dbProducts = [];
  }
}

function getProductsSource() {
  return dbProducts.length ? dbProducts : products;
}

function getCart() {
  return JSON.parse(localStorage.getItem('techgear-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('techgear-cart', JSON.stringify(cart));
  updateCartCount();
}

function productCard(product) {
  return `
  <div class="bg-slate-900 rounded-xl p-4">

    <div class="w-full h-48 rounded-lg mb-4 flex items-center justify-center">
<img src="assets/${product.image}" alt="${product.name}" class="max-h-full max-w-full object-contain">    </div>

    <h3 class="font-semibold mb-1">${product.name}</h3>
    <p class="text-slate-400 text-sm mb-2">${product.description}</p>

    <p class="text-sm font-semibold mb-2 ${
      product.stock == 0 ? 'text-red-500' : 'text-green-400'
    }">
      ${product.stock == 0 ? 'Agotado' : `Stock: ${product.stock}`}
    </p>

    <div class="flex justify-between items-center">
      <span class="font-bold">$${product.price.toFixed(2)}</span>

      ${
        product.stock == 0
          ? `<button disabled class="bg-gray-600 px-3 py-1 rounded text-sm cursor-not-allowed">Sin stock</button>`
          : `<button data-add-cart="${product.id}" class="bg-blue-600 px-3 py-1 rounded text-sm">Agregar</button>`
      }

    </div>

  </div>`;
}
const productos = JSON.parse(localStorage.getItem("productos")) || [];
const contenedor = document.getElementById("productos");

if (contenedor) {
  productos.forEach(p => {
    contenedor.innerHTML += `
      <div>
        <img src="${p.imagen}" width="150">
        <h3>${p.nombre}</h3>
        <p>$${p.precio}</p>
      </div>
    `;
  });
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);

  //  ELIMINAR EN BD
  fetch("api/carrito_delete.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      producto_id: parseInt(productId)
    })
  });
}

function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity = quantity;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);

  //  ACTUALIZAR EN BD
  fetch("api/carrito_update.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      producto_id: parseInt(productId),
      cantidad: quantity
    })
  });
}
async function cargarCarritoDesdeBD() {
  try {
    const resp = await fetch("api/carrito_get.php", {
      credentials: "include"
    });

    const data = await resp.json();

    if (data.ok) {
      localStorage.setItem("techgear-cart", JSON.stringify(data.carrito));
      updateCartCount();

      console.log("Carrito cargado desde BD:", data.carrito);
    } else{
      localStorage.removeItem("techgear-cart");
      updateCartCount();

      console.log("Carrito limpiado (usuario no logueado)");
    }

  } catch (error) {
    console.error("Error cargando carrito:", error);
  }
}
function getTotalCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getTotalPrice() {
  return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartCount() {
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    const count = getTotalCount();
    el.textContent = count;
    el.classList.toggle('hidden', count === 0);
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function currentPage() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  return file === '' ? 'index.html' : file;
}

function headerTemplate() {
  const page = currentPage();
  return `
  <header class="bg-[#1f1f1f] border-b border-black">
    
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

            <!-- Logo -->
        <a href="index.html" class="flex items-center gap-2 font-bold">
        
      <span class="text-2xl font-bold logo-text">
        Logitech
      </span>

        <img src="assets/G.png" alt="G" class="h-8 w-auto">

      </a>

              <!-- Nav -->
              <nav class="hidden md:flex gap-8 text-white text-sm font-medium">
          ${navLink('index.html','Inicio', page)}
          ${navLink('productos.html','Productos', page)}
          ${navLink('contacto.html','Contacto', page)}
          ${navLink('nosotros.html','Nosotros', page)}
        </nav>

      <!-- Icons -->
      <div class="flex items-center gap-5 text-white text-xl">

                <!-- Lupa -->
        <button id="searchToggle" aria-label="Abrir buscador" class="hover:opacity-80 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <circle cx="11" cy="11" r="7" stroke-width="2"/>
            <line x1="20" y1="20" x2="16.5" y2="16.5" stroke-width="2"/>
          </svg>
        </button>

        <!-- Carrito -->
        <a href="carrito.html" class="relative hover:opacity-80 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <circle cx="9" cy="20" r="1.5" stroke-width="2"/>
            <circle cx="17" cy="20" r="1.5" stroke-width="2"/>
            <path d="M3 3h2l2.5 12h11l2-8H6" stroke-width="2"/>
          </svg>
          <span data-cart-count class="hidden absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center"></span>
        </a>

        <!-- Usuario -->
        <div id="userArea" class="hover:opacity-80 transition cursor-pointer">
        </div>
      </div>

    </div>


    <!-- Buscador expandido -->
    <div id="searchBar" class="hidden border-t border-white/10 bg-[#1f1f1f] px-4 py-3">
      <div class="max-w-7xl mx-auto flex gap-3">

        <input 
          id="headerSearchInput"
          type="text" 
          placeholder="Buscar productos..."
          class="flex-1 bg-black border border-blue-500 text-white px-4 py-2 rounded-lg outline-none"
        >

        <button id="searchBtn" class="bg-blue-500 px-4 py-2 rounded text-white">
          Buscar
        </button>

        <button id="cancelSearch" class="text-white px-3">
          Cancelar
        </button>

      </div>
    </div>

  </header>`;
}

async function cargarUsuario() {
  const resp = await fetch('api/me.php', {
    credentials: 'include'
  });

  const data = await resp.json();

  const userArea = document.getElementById("userArea");
  if (!userArea) return;

  if (data.ok) {
    const user = data.usuario;

    userArea.innerHTML = 
    `<div class="flex items-center gap-2 text-cyan-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
        <circle cx="12" cy="8" r="4" stroke-width="2"/>
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke-width="2"/>
      </svg> 
      <span>${user.usuario}</span>
    </div>`;

    userArea.onclick = () => {
      window.location.href = "perfil.html";
    };

  } else {
    userArea.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
    <circle cx="12" cy="8" r="4" stroke-width="2"/>
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke-width="2"/>
  </svg>`;

    userArea.onclick = () => {
      window.location.href = "login.html";
    };
  }
}



function navLink(href, label, page) {
  const active = href === page ? 'active' : '';
  return `<a class="nav-link relative hover:text-white transition-colors ${active}" href="${href}">${label}</a>`;
}

function mobileNavLink(href, label, page) {
  const active = href === page ? 'text-white' : 'text-slate-300';
  return `<a class="${active} hover:text-white transition-colors" href="${href}">${label}</a>`;
}

function footerTemplate() {
  return `
  <footer class="bg-slate-900 border-t border-slate-800 py-10">
    <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">

      <div>
        <div class="flex items-center gap-2 mb-3">

          <span class="text-xl font-bold logo-text">
            Logitech
          </span>

          <img src="assets/G.png" alt="G" class="h-6 w-auto">

        </div>
          <p class="text-slate-400 text-sm">
            Los mejores juegos del mercado en un instante
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">Nosotros</h4>
          <p class="text-slate-400 text-sm">Sobre nosotros</p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">Contactos</h4>
          <p class="text-slate-400 text-sm">contact@logitech.com</p>
          <p class="text-slate-400 text-sm">+1 888 888 888</p>
        </div>

    </div>
  </footer>`;
}

function renderShell() {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  if (header){ header.innerHTML = headerTemplate();
    cargarUsuario();
  }
  if (footer) footer.innerHTML = footerTemplate();
  wireShellEvents();
  updateCartCount();
}
function wireShellEvents() {
  const menu = document.getElementById('mobileMenu');

  if (menu) {
    document.querySelectorAll('[data-mobile-menu-button]').forEach(btn => {
      btn.addEventListener('click', () => menu.classList.toggle('open'));
    });
  }


  const toggle = document.getElementById('searchToggle');
  const bar = document.getElementById('searchBar');
  const cancel = document.getElementById('cancelSearch');
  const btn = document.getElementById('searchBtn');
  const input = document.getElementById('headerSearchInput');

  if (toggle && bar) {
    toggle.addEventListener('click', () => {
      bar.classList.remove('hidden');
      input?.focus();
    });
  }

  if (cancel && bar) {
    cancel.addEventListener('click', () => {
      bar.classList.add('hidden');
    });
  }

  if (btn && input) {
    btn.addEventListener('click', () => {
      const value = input.value.trim();
      window.location.href = value 
        ? `productos.html?buscar=${encodeURIComponent(value)}`
        : 'productos.html';
    });
  }

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const value = input.value.trim();
        window.location.href = value 
          ? `productos.html?buscar=${encodeURIComponent(value)}`
          : 'productos.html';
      }
    });
  }


  const submitSearch = (inputId, formId) => {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    if (!form || !input) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();
      window.location.href = value 
        ? `productos.html?buscar=${encodeURIComponent(value)}`
        : 'productos.html';
    });
  };

  submitSearch('headerSearchInput', 'headerSearchForm');
  submitSearch('mobileSearchInput', 'mobileSearchForm');
}


function categoryCard(category) {
  return `
  <a href="productos.html?categoria=${category.id}" class="relative rounded-xl overflow-hidden group block">
    
    <img src="${category.image}" alt="${category.name}" class="w-full h-40 object-cover">

    <div class="absolute inset-0 bg-black/50 flex items-end p-3">
      <span class="text-white font-semibold">${category.name}</span>
    </div>

  </a>`;
}

function wireAddToCartButtons(scope = document) {
  scope.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.addCart));
  });
}
function addToCart(productId) {

  // 🔍 buscar producto en tu lista
  const product = getProductsSource().find(p => p.id == productId);
  if (!product) return;

  // 🛒 carrito actual
  const cart = getCart();

  // 🔁 verificar si ya existe
  const existing = cart.find(item => item.id == productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      quantity: 1
    });
  }

  // 💾 guardar en localStorage (tu lógica actual)
  saveCart(cart);

  // 🔥 AQUÍ VA EL FETCH (LO QUE ME PREGUNTASTE)
  fetch("api/carrito.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      producto_id: parseInt(productId),
      cantidad: 1
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Guardado en BD:", data);
  })
  .catch(err => {
    console.error("Error:", err);
  });

  showToast("Producto agregado al carrito 🛒");
}

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function renderProductsPage() {
  const grid = document.getElementById('productsGrid');
  const listCount = document.getElementById('productsCount');
  const activeSearch = document.getElementById('activeSearch');
  const sidebar = document.getElementById('categoryFilters');
  if (!grid) return;

  const params = getQueryParams();
  const category = params.get('categoria') || 'all';
  const search = (params.get('buscar') || '').toLowerCase();

  if (sidebar) {
    sidebar.innerHTML = `
      <button data-cat="all" class="w-full text-left px-4 py-2 rounded-lg ${category === 'all' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">Todos</button>
      ${categories.map(c => `<button data-cat="${c.id}" class="w-full text-left px-4 py-2 rounded-lg ${String(category) === String(c.id) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">${c.name}</button>`).join('')}`;
    sidebar.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newParams = new URLSearchParams(window.location.search);
        const cat = btn.dataset.cat;
        if (cat === 'all') newParams.delete('categoria');
        else newParams.set('categoria', cat);
        window.location.search = newParams.toString();
      });
    });
  }

  let filtered = [...getProductsSource()];

if (category !== 'all') {
  filtered = filtered.filter(p =>
  p.category.toLowerCase().replace(/\s+/g, '_') === category
);
}

if (search) {
  filtered = filtered.filter(p =>
    [p.name, p.description, p.category]
      .some(v => String(v || '').toLowerCase().includes(search))
  );
}

  if (listCount) listCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}${search ? ' encontrados' : ''}`;
  if (activeSearch) {
    activeSearch.innerHTML = search ? `
      <div class="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-2 rounded-lg">
        <span>Buscando: "${search}"</span>
        <a href="productos.html${category !== 'all' ? `?categoria=${category}` : ''}" class="hover:text-white">✕</a>
      </div>` : '';
  }

  grid.innerHTML = filtered.length ? filtered.map(productCard).join('') : `<div class="col-span-full empty-state flex items-center justify-center text-center"><div><p class="text-slate-400 text-lg mb-3">No se encontraron productos.</p><a href="productos.html" class="text-blue-400 hover:text-blue-300">Limpiar búsqueda</a></div></div>`;
  wireAddToCartButtons(grid);
}

function renderHomePage() {
  const catGrid = document.getElementById('homeCategories');
  const featuredGrid = document.getElementById('featuredProducts');
  if (catGrid) catGrid.innerHTML = categories.map(categoryCard).join('');
  if (featuredGrid) {
    featuredGrid.innerHTML = getProductsSource().slice(0, 3).map(productCard).join('');
    wireAddToCartButtons(featuredGrid);
  }
}

function renderCartPage() {
  const itemsWrap = document.getElementById('cartItems');
  const subtotal = document.getElementById('cartSubtotal');
  const total = document.getElementById('cartTotal');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartContent = document.getElementById('cartContent');
  if (!itemsWrap) return;
  const cart = getCart();

  if (cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartContent.classList.add('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');
  cartContent.classList.remove('hidden');
  itemsWrap.innerHTML = cart.map(item => `
    <div class="glass-card rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row gap-6">
      <img src="assets/${item.image}" alt="${item.name}" class="w-full sm:w-32 h-32 object-cover rounded-xl bg-slate-800">
      <div class="flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 class="text-white text-xl font-semibold mb-2">${item.name}</h3>
          <p class="text-slate-400 text-sm">${item.description}</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <button data-minus="${item.id}" class="w-9 h-9 rounded-lg bg-slate-800 text-white">−</button>
            <span class="w-8 text-center text-white font-semibold">${item.quantity}</span>
            <button data-plus="${item.id}" class="w-9 h-9 rounded-lg bg-slate-800 text-white">+</button>
          </div>
          <div class="flex items-center gap-4">
            <strong class="text-white text-2xl">$${(item.price * item.quantity).toFixed(2)}</strong>
            <button data-remove="${item.id}" class="text-red-400">🗑</button>
          </div>
        </div>
      </div>
    </div>`).join('');

  if (subtotal) subtotal.textContent = `$${getTotalPrice().toFixed(2)}`;
  if (total) total.textContent = `$${getTotalPrice().toFixed(2)}`;

  itemsWrap.querySelectorAll('[data-plus]').forEach(btn => btn.addEventListener('click', () => { const id = btn.dataset.plus; const item = getCart().find(i => i.id === id); updateQuantity(id, item.quantity + 1); renderCartPage(); }));
  itemsWrap.querySelectorAll('[data-minus]').forEach(btn => btn.addEventListener('click', () => { const id = btn.dataset.minus; const item = getCart().find(i => i.id === id); updateQuantity(id, item.quantity - 1); renderCartPage(); }));
  itemsWrap.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => { removeFromCart(btn.dataset.remove); renderCartPage(); }));
}

function wireContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      nombre: document.getElementById("nombre").value,
      email: document.getElementById("email").value,
      asunto: document.getElementById("asunto").value,
      mensaje: document.getElementById("mensaje").value
    };

    try {
      const resp = await fetch("api/contacto.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const res = await resp.json();

      if (res.ok) {
        form.reset();
        showToast("Mensaje enviado correctamente ✅");
      } else {
        showToast("Error: " + res.mensaje);
      }

    } catch (error) {
      console.error(error);
      showToast("Error de conexión ❌");
    }
  });
}

function wireCheckoutForm() {
  setTimeout(() => {  // 🔥 ESTO ARREGLA TODO

    const form = document.getElementById('checkoutForm');
    if (!form) return;

    const total = document.getElementById('checkoutTotal');
    if (total) total.textContent = `$${getTotalPrice().toFixed(2)}`;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        nombre: document.getElementById('nombre')?.value || '',
        apellido: document.getElementById('apellido')?.value || '',
        correo: document.getElementById('correo')?.value || '',
        telefono: document.getElementById('telefono')?.value || '',
        direccion: document.getElementById('direccion')?.value || '',
        ciudad: document.getElementById('ciudad')?.value || '',
        provincia: document.getElementById('provincia')?.value || '',
        codigo_postal: document.getElementById('codigo_postal')?.value || '',
        metodo_pago: document.getElementById('metodo_pago')?.value || ''
      };

      console.log("DATA QUE SE ENVÍA:", data); // 🔥 DEBUG

      try {
        const resp = await fetch('api/checkout.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        const res = await resp.json();

        if (res.ok) {
          localStorage.removeItem('techgear-cart');
          updateCartCount();
          form.reset();
          showToast('Compra realizada correctamente ✅');
        } else {
          showToast('Error: ' + res.mensaje);
        }

      } catch (error) {
        console.error(error);
        showToast('Error de conexión ❌');
      }
    });

  }, 100); // 🔥 pequeño delay
}
async function cargarPedidos() {
  const container = document.getElementById("pedidosContainer");
  if (!container) return;

  try {
    const resp = await fetch("api/pedidos_get.php", {
      credentials: "include"
    });

    const data = await resp.json();

    if (!data.ok) {
      container.innerHTML = "<p>No hay pedidos</p>";
      return;
    }

    if (data.pedidos.length === 0) {
      container.innerHTML = "<p class='text-slate-400'>No has realizado compras aún.</p>";
      return;
    }

    container.innerHTML = data.pedidos.map(pedido => `
      <div class="glass-card p-6 rounded-xl">
        <div class="flex justify-between mb-4">
          <div>
            <p class="font-semibold">Pedido #${pedido.id}</p>
            <p class="text-sm text-slate-400">Fecha: ${pedido.fecha}</p>
          </div>
          <div class="font-bold text-green-400">
            $${parseFloat(pedido.total).toFixed(2)}
          </div>
        </div>

        <div class="space-y-3">
          ${pedido.productos.map(prod => `
            <div class="flex items-center gap-4">
              <img src="assets/${prod.imagen}" alt="${prod.nombre}" class="w-12 h-12 object-cover rounded">
              <div class="flex-1">
                <p>${prod.nombre}</p>
                <p class="text-sm text-slate-400">Cantidad: ${prod.cantidad}</p>
              </div>
              <div>
                $${(prod.precio * prod.cantidad).toFixed(2)}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Error cargando pedidos</p>";
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await cargarProductosDB();
  await cargarCarritoDesdeBD();
  await cargarPedidos();
  renderShell();
  renderHomePage();
  renderProductsPage();
  renderCartPage();
  wireContactForm();
  wireCheckoutForm();
});


