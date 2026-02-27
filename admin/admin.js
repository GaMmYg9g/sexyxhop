// ============================================
// LUXURIA ADMIN - LÓGICA PRINCIPAL
// ============================================

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
    const adminData = JSON.parse(localStorage.getItem('luxuriaAdmin'));
    
    if (!adminData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar datos del admin
    const adminNombre = document.getElementById('adminNombre');
    const adminRol = document.getElementById('adminRol');
    
    if (adminNombre) adminNombre.textContent = adminData.nombre;
    if (adminRol) adminRol.textContent = adminData.rol.toUpperCase();
    
    // Ocultar opciones según rol
    if (adminData.rol !== 'superadmin') {
        ocultarOpcionesAdminVisual();
    }
    
    // Cargar datos según la página
    cargarDatosPagina();
});

function logout() {
    localStorage.removeItem('luxuriaAdmin');
    window.location.href = 'login.html';
}

function ocultarOpcionesAdminVisual() {
    const elementosEdit = document.querySelectorAll('.solo-superadmin');
    elementosEdit.forEach(el => el.style.display = 'none');
}

function cargarDatosPagina() {
    const pagina = window.location.pathname.split('/').pop();
    
    switch(pagina) {
        case 'ventas.html':
            cargarVentas();
            break;
        case 'inventario.html':
            cargarInventario();
            break;
        case 'productos-edit.html':
            cargarProductosEdit();
            break;
        case 'admins.html':
            cargarAdmins();
            break;
    }
}

// ===== FUNCIONES PARA VENTAS =====
function cargarVentas() {
    const pedidos = JSON.parse(localStorage.getItem('luxuriaHistorial')) || [];
    const tbody = document.getElementById('tablaVentas');
    
    if (!tbody) return;
    
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: #888;">No hay ventas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = pedidos.map(pedido => `
        <tr>
            <td>${pedido.numero}</td>
            <td>${pedido.cliente.nombre}</td>
            <td>${new Date(pedido.fecha).toLocaleDateString()}</td>
            <td>$${pedido.total.toFixed(2)}</td>
            <td><span class="status-badge status-pendiente">PENDIENTE</span></td>
            <td>
                <button class="btn-accion" onclick="verPedido('${pedido.numero}')"><i class="fas fa-eye"></i></button>
                <button class="btn-accion solo-superadmin" onclick="cambiarEstado('${pedido.numero}')"><i class="fas fa-check"></i></button>
            </td>
        </tr>
    `).join('');
}

// ===== FUNCIONES PARA INVENTARIO =====
function cargarInventario() {
    const productos = obtenerProductos();
    const limites = JSON.parse(localStorage.getItem('luxuriaLimitesStock')) || {};
    const tbody = document.getElementById('tablaInventario');
    
    if (!tbody) return;
    
    tbody.innerHTML = productos.map(p => {
        const limite = limites[p.id] || 5;
        const stockBajo = p.stock < limite && p.stock > 0;
        const stockClass = stockBajo ? 'stock-bajo' : '';
        
        return `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td class="${stockClass}"><strong>${p.stock}</strong> ${stockBajo ? '⚠️' : ''}</td>
                <td>${p.agotado ? 'SÍ' : 'NO'}</td>
                <td>
                    <button class="btn-accion solo-superadmin" onclick="editarStock(${p.id})"><i class="fas fa-edit"></i></button>
                    ${stockBajo ? `<button class="btn-accion" onclick="enviarAlerta('${p.nombre}', ${p.stock})"><i class="fab fa-whatsapp"></i></button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// ===== FUNCIONES PARA WHATSAPP =====
function obtenerNumeroWhatsApp() {
    return localStorage.getItem('luxuriaWhatsApp') || '1234567890';
}

function enviarAlerta(producto, stock) {
    const numero = obtenerNumeroWhatsApp();
    const mensaje = `*🔴 ALERTA DE STOCK BAJO - LUXURIA SHOP*%0A%0AProducto: ${producto}%0AStock actual: ${stock} unidades%0A%0A_Generado automáticamente desde el panel admin_`;
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
}

function enviarTodasAlertas() {
    const numero = obtenerNumeroWhatsApp();
    const productos = obtenerProductos();
    const limites = JSON.parse(localStorage.getItem('luxuriaLimitesStock')) || {};
    
    const stockBajo = productos.filter(p => {
        const limite = limites[p.id] || 5;
        return p.stock < limite && p.stock > 0;
    });
    
    if (stockBajo.length === 0) {
        alert('No hay productos con stock bajo');
        return;
    }
    
    let mensaje = `*🔴 ALERTA DE STOCK BAJO - LUXURIA SHOP*%0A%0A`;
    mensaje += `Productos que necesitan reposición:%0A%0A`;
    
    stockBajo.forEach(p => {
        const limite = limites[p.id] || 5;
        mensaje += `• ${p.nombre}: ${p.stock}/${limite} unidades%0A`;
    });
    
    mensaje += `%0A_Generado automáticamente desde el panel admin_`;
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
}

// ===== FUNCIONES AUXILIARES =====
function verPedido(numero) {
    const pedidos = JSON.parse(localStorage.getItem('luxuriaHistorial')) || [];
    const pedido = pedidos.find(p => p.numero === numero);
    
    if (!pedido) return;
    
    let detalle = `PEDIDO: ${pedido.numero}\n`;
    detalle += `CLIENTE: ${pedido.cliente.nombre}\n`;
    detalle += `TELÉFONO: ${pedido.cliente.telefono}\n`;
    detalle += `FECHA: ${new Date(pedido.fecha).toLocaleString()}\n\n`;
    detalle += `PRODUCTOS:\n`;
    
    pedido.productos.forEach(p => {
        detalle += `- ${p.nombre} x${p.cantidad} = $${(p.precio * p.cantidad).toFixed(2)}\n`;
    });
    
    detalle += `\nTOTAL: $${pedido.total.toFixed(2)}`;
    
    alert(detalle);
}

function cambiarEstado(numero) {
    alert(`Función en desarrollo: Cambiar estado del pedido ${numero}`);
}

function editarStock(id) {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return;
    
    const nuevoStock = prompt(`Editar stock de ${producto.nombre}\nStock actual: ${producto.stock}`, producto.stock);
    
    if (nuevoStock !== null && !isNaN(nuevoStock) && nuevoStock >= 0) {
        alert(`Stock actualizado a ${nuevoStock} (simulado)\nEn versión real se guardaría en productos.js`);
    }
}

function cargarProductosEdit() {
    const productos = obtenerProductos();
    const container = document.getElementById('productosEditContainer');
    
    if (!container) return;
    
    container.innerHTML = productos.map(p => `
        <div style="background: var(--negro); padding: 1rem; margin-bottom: 1rem; border-radius: 10px;">
            <h4>${p.nombre}</h4>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                <label>Precio:</label>
                <input type="number" id="precio_${p.id}" value="${p.precio}" step="0.01" style="background: var(--negro-suave); border: 1px solid var(--gris); color: var(--marfil); padding: 0.3rem; border-radius: 4px;">
                
                <label>Stock:</label>
                <input type="number" id="stock_${p.id}" value="${p.stock}" style="background: var(--negro-suave); border: 1px solid var(--gris); color: var(--marfil); padding: 0.3rem; border-radius: 4px;">
            </div>
        </div>
    `).join('');
}

function cargarAdmins() {
    const admins = [
        { usuario: "superadmin", nombre: "Administrador Principal", rol: "superadmin" },
        { usuario: "admin", nombre: "Gerente", rol: "admin" }
    ];
    
    const tbody = document.getElementById('adminsBody');
    if (!tbody) return;
    
    tbody.innerHTML = admins.map(a => `
        <tr>
            <td>${a.usuario}</td>
            <td>${a.nombre}</td>
            <td>${a.rol}</td>
            <td>
                <button class="btn-accion" onclick="alert('Función en desarrollo')"><i class="fas fa-edit"></i></button>
                ${a.usuario !== 'superadmin' ? '<button class="btn-accion" onclick="alert(\'Función en desarrollo\')"><i class="fas fa-trash"></i></button>' : ''}
            </td>
        </tr>
    `).join('');
}

// Función auxiliar para obtener productos
function obtenerProductos() {
    if (typeof window.productos !== 'undefined') {
        return window.productos;
    }
    
    // Intentar cargar desde productos.js si existe
    if (typeof productos !== 'undefined') {
        return productos;
    }
    
    // Datos de ejemplo
    return [
        { id: 1, nombre: "CAMISA DE SEDA NEGRA", precio: 89.99, stock: 15, categoria: "ropa", agotado: false },
        { id: 2, nombre: "PANTALÓN DE VESTIR BORGOÑA", precio: 129.99, stock: 8, categoria: "ropa", agotado: false },
        { id: 3, nombre: "CINTURÓN DORADO", precio: 45.50, stock: 2, categoria: "accesorios", agotado: false },
        { id: 4, nombre: "LENCERÍA ENCAJE", precio: 79.99, stock: 5, categoria: "intimo", agotado: false },
        { id: 5, nombre: "ACEITE CORPORAL DORADO", precio: 34.99, stock: 12, categoria: "intimo", agotado: false },
        { id: 6, nombre: "GAFAS DE SOL ELEGANTES", precio: 149.99, stock: 0, categoria: "accesorios", agotado: false },
        { id: 7, nombre: "SET DE VELAS AROMÁTICAS", precio: 59.99, stock: 3, categoria: "ofertas", agotado: false },
        { id: 8, nombre: "ESPEJO CON LUCES", precio: 89.99, stock: 4, categoria: "ofertas", agotado: false }
    ];
}