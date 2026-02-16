<?php
$dbFile = __DIR__ . '/erotic-store.db';
$exists = file_exists($dbFile);

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if (!$exists) {
        // Crear tablas
        $db->exec("
            CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                stock INTEGER DEFAULT 0,
                category TEXT,
                image TEXT,
                rating REAL DEFAULT 0,
                reviews_count INTEGER DEFAULT 0,
                commission_type TEXT DEFAULT 'percentage',
                commission_value REAL DEFAULT 10,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                user_name TEXT,
                user_phone TEXT,
                items TEXT,
                total_commission REAL DEFAULT 0,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT,
                email TEXT UNIQUE,
                password TEXT,
                is_admin INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                user_id INTEGER,
                user_name TEXT,
                rating INTEGER,
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");
        
        // Crear admin por defecto
        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $db->exec("INSERT INTO users (name, email, password, is_admin) VALUES ('Admin', 'admin@tienda.com', '$hash', 1)");
        
        // Productos de ejemplo
        $db->exec("
            INSERT INTO products (name, price, stock, category, image, description, rating, reviews_count) VALUES 
            ('Set Lencería Neón', 49.99, 25, 'lenceria', 'https://via.placeholder.com/300x400?text=Lenceria+Neon', 'Conjunto de lencería con detalles neón', 4.5, 12),
            ('Aceite Corporal Brillante', 29.99, 40, 'bienestar', 'https://via.placeholder.com/300x400?text=Aceite+Neon', 'Aceite con brillantina neón', 4.8, 8),
            ('Vibrador Neón Purple', 89.99, 10, 'juguetes', 'https://via.placeholder.com/300x400?text=Vibrador+Neon', 'Silicona con luz neón', 5.0, 5);
        ");
    }
    
} catch(PDOException $e) {
    die(json_encode(['error' => $e->getMessage()]));
}
?>
