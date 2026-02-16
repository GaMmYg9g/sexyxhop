import { sql } from './db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    try {
        const products = await sql`SELECT COUNT(*) as count FROM products`;
        const orders = await sql`SELECT COUNT(*) as count FROM orders`;
        const users = await sql`SELECT COUNT(*) as count FROM users`;
        const lowStock = await sql`SELECT COUNT(*) as count FROM products WHERE stock < 5`;
        
        res.json({
            products: products[0].count,
            orders: orders[0].count,
            users: users[0].count,
            low_stock: lowStock[0].count
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}