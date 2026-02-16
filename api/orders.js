import { sql } from './db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const orders = await sql`
                SELECT * FROM orders ORDER BY id DESC LIMIT 20
            `;
            
            const parsedOrders = orders.map(order => ({
                ...order,
                items: JSON.parse(order.items)
            }));
            
            res.json(parsedOrders);
        }
        
        else if (req.method === 'POST') {
            const data = req.body;
            
            if (data.status) {
                // Actualizar estado
                await sql`
                    UPDATE orders SET status = ${data.status} WHERE id = ${data.id}
                `;
                res.json({ success: true });
            } else {
                // Crear nuevo pedido
                const result = await sql`
                    INSERT INTO orders (
                        user_id, user_name, user_phone, items, status
                    ) VALUES (
                        ${data.user_id}, ${data.user_name}, ${data.user_phone},
                        ${JSON.stringify(data.items)}, 'pending'
                    ) RETURNING id
                `;
                
                // Reducir stock
                for (const item of data.items) {
                    await sql`
                        UPDATE products 
                        SET stock = stock - ${item.quantity}
                        WHERE id = ${item.id}
                    `;
                }
                
                res.json({ success: true, id: result[0].id });
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}