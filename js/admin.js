const API_URL = 'api/';
let token = localStorage.getItem('adminToken');

// ========== LOGIN ==========
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(API_URL + 'login.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        
        const data = await response.json();
        
        if (data.success) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            loadDashboard();
        } else {
            showToast('Credenciales incorrectas', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// ========== DASHBOARD ==========
async function loadDashboard() {
    await loadProducts();
    await loadOrders();
    await loadStats();
}

// ========== PRODUCTOS ==========
async function loadProducts() {
    try {
        const response = await fetch(API_URL + 'get-products.php');
        const products = await response.json();
        
        const tbody = document.getElementById('productsBody');
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td><img src="${p.image || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; object-fit:cover; border-radius:5px;"></td>
                <td>${p.name}</td>
                <td>$${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>${p.category}</td>
                <td>${p.commission_type == 'fixed' ? '$' : ''}${p.commission_value}${p.commission_type == 'percentage' ? '%' : ''}</td>
                <td>
                    <button class="btn" onclick="editProduct(${p.id})">✏️</button>
                    <button class="btn" onclick="deleteProduct(${p.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Error cargando productos', 'error');
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const product = {
        id: document.getElementById('productId').value,
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        stock: document.getElementById('productStock').value,
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        commission_type: document.getElementById('commissionType').value,
        commission_value: document.getElementById('commissionValue').value
    };
    
    try {
        const response = await fetch(API_URL + 'save-product.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(product)
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Producto guardado');
            clearForm();
            loadProducts();
        }
    } catch (error) {
        showToast('Error guardando', 'error');
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(API_URL + 'get-products.php?id=' + id);
        const product = await response.json();
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('commissionType').value = product.commission_type;
        document.getElementById('commissionValue').value = product.commission_value;
        
        window.scrollTo({top: 0, behavior: 'smooth'});
    } catch (error) {
        showToast('Error cargando', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar producto?')) return;
    
    try {
        const response = await fetch(API_URL + 'delete-product.php?id=' + id);
        const data = await response.json();
        if (data.success) {
            showToast('Producto eliminado');
            loadProducts();
        }
    } catch (error) {
        showToast('Error eliminando', 'error');
    }
}

// ========== PEDIDOS ==========
async function loadOrders() {
    try {
        const response = await fetch(API_URL + 'get-orders.php');
        const orders = await response.json();
        
        const tbody = document.getElementById('ordersBody');
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td>${o.user_name}</td>
                <td>${o.user_phone}</td>
                <td>${o.items ? JSON.parse(o.items).map(i => i.name).join(', ') : ''}</td>
                <td><span class="status status-${o.status}">${o.status}</span></td>
                <td>
                    <select onchange="updateOrderStatus(${o.id}, this.value)">
                        <option value="pending" ${o.status=='pending'?'selected':''}>Pendiente</option>
                        <option value="completed" ${o.status=='completed'?'selected':''}>Completado</option>
                        <option value="cancelled" ${o.status=='cancelled'?'selected':''}>Cancelado</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Error cargando pedidos', 'error');
    }
}

async function updateOrderStatus(id, status) {
    try {
        const response = await fetch(API_URL + 'update-order.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id, status})
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Estado actualizado');
            loadOrders();
        }
    } catch (error) {
        showToast('Error actualizando', 'error');
    }
}

// ========== ESTADÍSTICAS ==========
async function loadStats() {
    try {
        const response = await fetch(API_URL + 'get-stats.php');
        const stats = await response.json();
        
        document.getElementById('statProducts').textContent = stats.products;
        document.getElementById('statOrders').textContent = stats.orders;
        document.getElementById('statUsers').textContent = stats.users;
        document.getElementById('statLowStock').textContent = stats.low_stock;
    } catch (error) {
        showToast('Error cargando stats', 'error');
    }
}

// ========== UTILIDADES ==========
function clearForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productForm').reset();
}

function logout() {
    localStorage.removeItem('adminToken');
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--neon-pink)' : 'var(--neon-purple)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== INICIALIZACIÓN ==========
if (token) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadDashboard();
}
