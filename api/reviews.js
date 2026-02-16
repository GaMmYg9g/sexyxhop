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
            const { id } = req.query;
            const reviews = await sql`
                SELECT * FROM reviews WHERE product_id = ${id} ORDER BY created_at DESC
            `;
            res.json(reviews);
        }
        
        else if (req.method === 'POST') {
            const review = req.body;
            
            await sql`
                INSERT INTO reviews (
                    product_id, user_id, user_name, rating, comment
                ) VALUES (
                    ${review.product_id}, ${review.user_id}, 
                    ${review.user_name}, ${review.rating}, ${review.comment}
                )
            `;
            
            // Actualizar rating promedio
            const avg = await sql`
                SELECT AVG(rating) as avg, COUNT(*) as count 
                FROM reviews WHERE product_id = ${review.product_id}
            `;
            
            await sql`
                UPDATE products 
                SET rating = ${avg[0].avg}, reviews_count = ${avg[0].count}
                WHERE id = ${review.product_id}
            `;
            
            res.json({ success: true });
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}