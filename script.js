// ============================================
// LUXURIA SHOP - LÓGICA PRINCIPAL
// ============================================

const WHATSAPP_NUMBER = "5356502201";
const TIENDA_NOMBRE = "LUXURIA SHOP";

// Estado
let carrito = JSON.parse(localStorage.getItem('luxuriaCarrito')) || [];
let usuario = JSON.parse(localStorage.getItem('luxuriaUsuario')) || null;

// Elementos DOM
const productosContainer = document.getElementById('productosContainer');
const contadorCarrito = document.getElementById('contadorCarrito');
const verCarritoBtn = document.getElementById('verCarrito');
const carritoModal = document.getElementById('carritoModal');
const cerrarCarritoBtn = document.getElementById('cerrarModal');
const carritoItems = document.getElementById('carritoItems');
const totalCarrito = document.getElementById('totalCarrito');
const subtotalCarrito = document.getElementById('subtotalCarrito');
const realizarPedidoBtn = document.getElementById('realizarPedido');
const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
const registroModal = document.getElementById('registroModal');
const cerrarRegistroBtn = document.getElementById('cerrarRegistroModal');
const formularioRegistro = document.getElementById('formularioRegistro');
const confirmacionModal = document.getElementById('confirmacionModal');
const numeroPedido = document.getElementById('numeroPedido');
const totalConfirmacion = document.getElementById('totalConfirmacion');
const seguirComprando = document.getElementById('seguirComprando');
const buscador = document.getElementById('buscador');
const categoriasContainer = document.getElementById('categorias');

// Filtros
let filtroCategoria = 'todos';
let filtroBusqueda = '';

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    cargarProductos();
    actualizarContadorCarrito();
    
    verCarritoBtn.addEventListener('click', abrirCarrito);
    cerrarCarritoBtn.addEventListener('click', cerrarCarritoModal);
    realizarPedidoBtn.addEventListener('click', procesarPedido);
    if (vaciarCarritoBtn) vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    cerrarRegistroBtn.addEventListener('click', () => cerrarModal(registroModal));
    formularioRegistro.addEventListener('submit', guardarRegistro);
    seguirComprando.addEventListener('click', () => cerrarModal(confirmacionModal));
    buscador.addEventListener('input', filtrarProductos);
    
    window.addEventListener('click', (e) => {
        if (e.target === carritoModal) cerrarCarritoModal();
        if (e.target === registroModal) cerrarModal(registroModal);
        if (e.target === confirmacionModal) cerrarModal(confirmacionModal);
    });
});

// ===== CATEGORÍAS DINÁMICAS (de todas las categorías de todos los productos) =====
function cargarCategorias() {
    // Extraer TODAS las categorías de todos los productos (array de arrays)
    const todasCategorias = productosData.productos.flatMap(p => p.categorias);
    const categoriasUnicas = [...new Set(todasCategorias)].sort();
    
    let html = '<button class="categoria active" data-categoria="todos">TODOS</button>';
    categoriasUnicas.forEach(cat => {
        html += `<button class="categoria" data-categoria="${cat}">${cat.toUpperCase()}</button>`;
    });
    
    categoriasContainer.innerHTML = html;
    
    document.querySelectorAll('.categoria').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.categoria').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroCategoria = btn.dataset.categoria;
            filtrarProductos();
        });
    });
}

// ===== FUNCIONES DE PRODUCTOS =====
function cargarProductos() {
    renderizarProductos(filtrarProductosArray());
}

function filtrarProductosArray() {
    let filtrados = productosData.productos;
    
    if (filtroBusqueda) {
        filtrados = filtrados.filter(p => 
            p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
        );
    }
    
    if (filtroCategoria !== 'todos') {
        // Filtra si el producto tiene la categoría seleccionada
        filtrados = filtrados.filter(p => p.categorias.includes(filtroCategoria));
    }
    
    return filtrados;
}

function filtrarProductos() {
    filtroBusqueda = buscador.value;
    renderizarProductos(filtrarProductosArray());
}

// ===== DETECTAR SI ES NUEVO (menos de 24h) =====
function esNuevo(fechaStr) {
    if (!fechaStr) return false;
    const fechaProducto = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora - fechaProducto;
    const diffHoras = diffMs / (1000 * 60 * 60);
    return diffHoras < 24;
}

function renderizarProductos(array) {
    if (!productosContainer) return;
    
    if (array.length === 0) {
        productosContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:4rem; color:#888;">No se encontraron productos</div>';
        return;
    }
    
    productosContainer.innerHTML = array.map(p => {
        const disponible = p.disponible;
        const estadoClass = disponible ? 'estado-disponible' : 'estado-agotado';
        const estadoTexto = disponible ? 'DISPONIBLE' : 'AGOTADO';
        const nuevo = esNuevo(p.fechaAgregado);
        
        // Generar detalles
        const propiedadesFijas = ['nombre', 'precio', 'imagen', 'categorias', 'disponible', 'fechaAgregado', 'oferta'];
        const detallesArray = [];
        for (const [key, value] of Object.entries(p)) {
            if (!propiedadesFijas.includes(key) && value) {
                const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                detallesArray.push({ label, valor: value });
            }
        }
        
        const detallesHTML = detallesArray.map(d => `
            <div class="especificacion-item">
                <span class="especificacion-label">${d.label}</span>
                <span class="especificacion-valor">${d.valor}</span>
            </div>
        `).join('');
        
        const nombreId = p.nombre.replace(/[^a-zA-Z0-9]/g, '_');
        
        return `
            <div class="producto-card" data-nombre="${p.nombre}">
                <div class="producto-imagen-wrapper">
                    <img src="${p.imagen}" alt="${p.nombre}" class="producto-imagen" onerror="this.src='${IMAGEN_DEFAULT}'">
                    
                    <!-- BADGES NOTIFICACIÓN (NEW / OFF) -->
                    <div class="producto-badges">
                        ${nuevo ? '<span class="badge badge-new">NEW</span>' : ''}
                        ${p.oferta ? '<span class="badge badge-off">OFF</span>' : ''}
                    </div>
                </div>
                
                <div class="producto-info">
                    <h3 class="producto-nombre">${p.nombre}</h3>
                    
                    <button class="btn-detalles" data-nombre="${p.nombre}">
                        <span class="btn-detalles-texto">VER DETALLES</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    
                    <div class="producto-especificaciones oculto" id="detalles-${nombreId}">
                        ${detallesHTML}
                    </div>
                    
                    <div class="producto-precio">
                        <small>USD</small> $${p.precio}
                    </div>
                    
                    <div class="producto-estado ${estadoClass}">${estadoTexto}</div>
                    
                    ${disponible ? 
                        `<button class="btn-agregar" onclick="agregarAlCarrito('${p.nombre}')">AGREGAR</button>` : 
                        `<button class="btn-agotado" disabled>⛔ AGOTADO</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    // Event listeners para detalles
    document.querySelectorAll('.btn-detalles').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const nombre = btn.dataset.nombre;
            const nombreId = nombre.replace(/[^a-zA-Z0-9]/g, '_');
            const detalles = document.getElementById(`detalles-${nombreId}`);
            const icon = btn.querySelector('i');
            const texto = btn.querySelector('.btn-detalles-texto');
            
            detalles.classList.toggle('oculto');
            if (detalles.classList.contains('oculto')) {
                icon.style.transform = 'rotate(0deg)';
                texto.textContent = 'VER DETALLES';
            } else {
                icon.style.transform = 'rotate(180deg)';
                texto.textContent = 'OCULTAR DETALLES';
            }
        });
    });
}

// ===== FUNCIONES DEL CARRITO (con nombre como identificador) =====
function agregarAlCarrito(nombre) {
    const producto = productosData.productos.find(p => p.nombre === nombre);
    if (!producto || !producto.disponible) return;
    
    const existente = carrito.find(item => item.nombre === nombre);
    
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            imagen: producto.imagen
        });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    
    const btn = event.target;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = 'scale(1)', 200);
}

function eliminarDelCarrito(nombre) {
    carrito = carrito.filter(item => item.nombre !== nombre);
    guardarCarrito();
    actualizarContadorCarrito();
    abrirCarrito();
}

function actualizarCantidad(nombre, nuevaCantidad) {
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(nombre);
        return;
    }
    
    const item = carrito.find(item => item.nombre === nombre);
    if (item) {
        item.cantidad = nuevaCantidad;
        guardarCarrito();
        abrirCarrito();
    }
}

function vaciarCarrito() {
    if (carrito.length === 0) return;
    if (confirm('¿Vaciar todo el carrito?')) {
        carrito = [];
        guardarCarrito();
        actualizarContadorCarrito();
        abrirCarrito();
    }
}

function guardarCarrito() {
    localStorage.setItem('luxuriaCarrito', JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    contadorCarrito.textContent = total;
}

function calcularTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    return { subtotal, total: subtotal };
}

// ===== MODALES =====
function abrirCarrito() {
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p style="text-align:center; padding:2rem; color:#888;">Tu carrito está vacío</p>';
        subtotalCarrito.textContent = '$0';
        totalCarrito.textContent = '$0';
    } else {
        const { subtotal, total } = calcularTotales();
        
        carritoItems.innerHTML = carrito.map(item => `
            <div class="carrito-item">
                <div class="carrito-item-info">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio.toFixed(2)} c/u</p>
                </div>
                <div class="carrito-item-cantidad">
                    <button class="btn-cantidad" onclick="actualizarCantidad('${item.nombre}', ${item.cantidad - 1})">−</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="actualizarCantidad('${item.nombre}', ${item.cantidad + 1})">+</button>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.nombre}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        subtotalCarrito.textContent = `$${subtotal.toFixed(2)}`;
        totalCarrito.textContent = `$${total.toFixed(2)}`;
    }
    
    carritoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarCarritoModal() {
    carritoModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function cerrarModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===== PROCESAR PEDIDO =====
function procesarPedido() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    cerrarCarritoModal();
    
    if (!usuario) {
        registroModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        enviarPedidoWhatsApp();
    }
}

function guardarRegistro(e) {
    e.preventDefault();
    
    usuario = {
        nombre: document.getElementById('regNombre').value,
        telefono: document.getElementById('regTelefono').value,
        fecha: new Date().toISOString()
    };
    
    localStorage.setItem('luxuriaUsuario', JSON.stringify(usuario));
    cerrarModal(registroModal);
    enviarPedidoWhatsApp();
}

// ===== ENVÍO A WHATSAPP =====
function enviarPedidoWhatsApp() {
    const { total } = calcularTotales();
    const numPedido = generarNumeroPedido();
    
    let mensaje = `*${TIENDA_NOMBRE} - NUEVO PEDIDO*%0A%0A`;
    mensaje += `*Cliente:* ${usuario.nombre}%0A`;
    mensaje += `*Teléfono:* ${usuario.telefono}%0A`;
    mensaje += `*Pedido:* ${numPedido}%0A%0A`;
    mensaje += `*PRODUCTOS*%0A`;
    
    carrito.forEach(item => {
        mensaje += `• ${item.nombre} x${item.cantidad} = $${(item.precio * item.cantidad).toFixed(2)}%0A`;
    });
    
    mensaje += `%0A*TOTAL: $${total.toFixed(2)}*`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank');
    
    numeroPedido.textContent = `#${numPedido}`;
    totalConfirmacion.textContent = `Total: $${total.toFixed(2)}`;
    confirmacionModal.classList.add('active');
    
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();
}

function generarNumeroPedido() {
    const f = new Date();
    return `LUX-${f.getFullYear()}${String(f.getMonth()+1).padStart(2,'0')}${String(f.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
}

// Exponer funciones
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.actualizarCantidad = actualizarCantidad;
window.vaciarCarrito = vaciarCarrito;
