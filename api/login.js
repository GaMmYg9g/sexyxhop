import { sql } from './db.js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { email, password } = req.body;

        // Buscar usuario en la base de datos
        const users = await sql`
            SELECT id, name, email, is_admin 
            FROM users 
            WHERE email = ${email} AND password = ${password} AND is_admin = 1
        `;

        if (users.length > 0) {
            // Login exitoso
            const user = users[0];
            res.json({ 
                success: true, 
                name: user.name,
                id: user.id,
                token: 'admin-token-' + Date.now() // Token simple
            });
        } else {
            // Credenciales incorrectas
            res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: error.message });
    }
}