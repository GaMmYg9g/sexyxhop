// Configuración
const API_URL = '/api';
let currentUser = null;
let cart = [];
let products = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    checkSession();
    setupEventListeners();
    registerServiceWorker();
});

// ========== PRODUCTOS ==========
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
        renderCategories(products);
        renderProducts(products);
    } catch (error) {
        showToast('Error cargando productos');
    }
}

function renderCategories(products) {
    const categories = ['todos', ...new Set(products.map(p => p.category))];
    const grid = document.getElementById('categoriesGrid');
    
    grid.innerHTML = categories.map(cat => `
        <div class="category-card ${cat === 'todos' ? 'active' : ''}" 
             onclick="filterByCategory('${cat}')">
            ${cat.toUpperCase()}
        </div>
    `).join('');
}

function filterByCategory(category) {
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    const filtered = category === 'todos' 
        ? products 
        : products.filter(p => p.category === category);
    renderProducts(filtered);
}

function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    
    grid.innerHTML = productsToRender.map(product => `
        <div class="product-card" onclick="showProduct(${product.id})">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x400?text=NEON'}" 
                     alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-rating">
                    <span class="stars">${renderStars(product.rating || 0)}</span>
                    <span class="reviews-count">(${product.reviews_count || 0})</span>
                </div>
                <button class="btn-add" onclick="event.stopPropagation(); addToCart(${product.id})">
                    AÑADIR 🔥
                </button>
            </div>
        </div>
    `).join('');
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ========== DETALLE PRODUCTO ==========
async function showProduct(productId) {
    const product = products.find(p => p.id == productId);
    
    try {
        const response = await fetch(`${API_URL}/reviews?id=${productId}`);
        const reviews = await response.json();
        
        document.getElementById('productModalTitle').textContent = product.name;
        
        document.getElementById('productDetail').innerHTML = `
            <div class="product-detail">
                <img src="${product.image || 'https://via.placeholder.com/500x500'}" 
                     alt="${product.name}" class="product-detail-image">
                
                <div class="product-detail-info">
                    <div class="product-detail-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <p class="product-detail-description">${product.description || 'Sin descripción'}</p>
                    
                    <button class="neon-button" onclick="addToCart(${product.id}); closeModal('productModal')">
                        AÑADIR AL CARRITO
                    </button>
                    
                    ${currentUser ? `
                        <div class="rating-section">
                            <h3>VALORAR</h3>
                            <div class="star-rating-input" id="starRating">
                                ${[1,2,3,4,5].map(i => `<span data-rating="${i}">★</span>`).join('')}
                            </div>
                            <textarea id="reviewComment" placeholder="Comentario..." rows="3"></textarea>
                            <button class="neon-button" onclick="submitReview(${product.id})">
                                ENVIAR
                            </button>
                        </div>
                    ` : ''}
                    
                    <div class="reviews-list">
                        <h3>RESEÑAS</h3>
                        ${reviews.map(review => `
                            <div class="review-item">
                                <div class="review-header">
                                    <span class="review-user">${review.user_name}</span>
                                    <span class="review-stars">${'★'.repeat(review.rating)}</span>
                                </div>
                                <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
                                ${review.comment ? `<div class="review-comment">${review.comment}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        if (currentUser) setupStarRating();
        
    } catch (error) {
        showToast('Error cargando detalles');
    }
    
    openModal('productModal');
}

function setupStarRating() {
    const stars = document.querySelectorAll('#starRating span');
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            stars.forEach((s, i) => {
                s.style.color = i < rating ? 'var(--neon-pink)' : '#444';
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.style.color = '#444');
        });
        
        star.addEventListener('click', () => {
            document.getElementById('starRating').dataset.selected = star.dataset.rating;
            stars.forEach((s, i) => {
                s.style.color = i < star.dataset.rating ? 'var(--neon-pink)' : '#444';
            });
        });
    });
}

async function submitReview(productId) {
    const rating = document.getElementById('starRating').dataset.selected;
    const comment = document.getElementById('reviewComment').value;
    
    if (!rating) {
        showToast('Selecciona puntuación', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                product_id: productId,
                user_id: currentUser.id,
                user_name: currentUser.name,
                rating: parseInt(rating),
                comment: comment
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showToast('¡Gracias por valorar!');
            closeModal('productModal');
            loadProducts();
        }
    } catch (error) {
        showToast('Error al enviar', 'error');
    }
}

// ========== CARRITO ==========
function addToCart(productId) {
    if (!currentUser) {
        openModal('authModal');
        return;
    }
    
    const product = products.find(p => p.id == productId);
    const existing = cart.find(i => i.id == productId);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartCount();
    showToast('Producto añadido 🔥');
}

function updateCartCount() {
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.querySelector('.cart-count').textContent = total;
}

document.getElementById('cartBtn').addEventListener('click', () => {
    if (!currentUser) {
        openModal('authModal');
        return;
    }
    renderCart();
    openModal('cartModal');
});

function renderCart() {
    const container = document.getElementById('cartItems');
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'https://via.placeholder.com/60x60'}" 
                 alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('cartTotal').textContent = total;
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id == productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id != productId);
        }
        renderCart();
        updateCartCount();
    }
}

async function confirmOrder() {
    if (cart.length === 0) {
        showToast('Carrito vacío', 'error');
        return;
    }
    
    try {
        const order = {
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_phone: currentUser.phone,
            items: cart,
            total_commission: 0
        };
        
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(order)
        });
        
        const result = await response.json();
        
        if (result.success) {
            const message = `🔔 NUEVO PEDIDO NEON\nCliente: ${currentUser.name}\nTel: ${currentUser.phone}\n\n${cart.map(i => `• ${i.name} x${i.quantity} ($${i.price * i.quantity})`).join('\n')}`;
            window.open(`https://wa.me/521234567890?text=${encodeURIComponent(message)}`);
            
            cart = [];
            updateCartCount();
            closeModal('cartModal');
            showToast('¡Pedido enviado!');
        }
    } catch (error) {
        showToast('Error al enviar', 'error');
    }
}

// ========== AUTENTICACIÓN ==========
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    currentUser = {
        id: Date.now(),
        name: document.getElementById('userName').value,
        phone: document.getElementById('userPhone').value,
        email: document.getElementById('userEmail').value
    };
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    document.querySelector('.user-status').classList.add('active');
    closeModal('authModal');
    showToast(`¡Bienvenido ${currentUser.name}!`);
});

document.getElementById('userBtn').addEventListener('click', () => {
    if (currentUser) {
        showToast(`Hola ${currentUser.name}`);
    } else {
        openModal('authModal');
    }
});

function checkSession() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.querySelector('.user-status').classList.add('active');
    }
}

// ========== UTILIDADES ==========
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--neon-pink)' : 'var(--neon-purple)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.log);
    }
}

function setupEventListeners() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
}
