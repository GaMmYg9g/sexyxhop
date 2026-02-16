import { sql } from './db.js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const { id } = req.query;
            
            if (id) {
                const products = await sql`
                    SELECT * FROM products WHERE id = ${id}
                `;
                res.json(products[0] || null);
            } else {
                const products = await sql`
                    SELECT * FROM products ORDER BY id DESC
                `;
                res.json(products);
            }
        }
        
        else if (req.method === 'POST') {
            const product = req.body;
            
            if (product.id) {
                await sql`
                    UPDATE products SET 
                        name = ${product.name},
                        price = ${product.price},
                        stock = ${product.stock},
                        category = ${product.category},
                        image = ${product.image},
                        description = ${product.description},
                        commission_type = ${product.commission_type},
                        commission_value = ${product.commission_value}
                    WHERE id = ${product.id}
                `;
            } else {
                await sql`
                    INSERT INTO products (
                        name, price, stock, category, image, 
                        description, commission_type, commission_value
                    ) VALUES (
                        ${product.name}, ${product.price}, ${product.stock}, 
                        ${product.category}, ${product.image}, ${product.description},
                        ${product.commission_type}, ${product.commission_value}
                    )
                `;
            }
            
            res.json({ success: true });
        }
        
        else if (req.method === 'DELETE') {
            const { id } = req.query;
            await sql`DELETE FROM products WHERE id = ${id}`;
            res.json({ success: true });
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}