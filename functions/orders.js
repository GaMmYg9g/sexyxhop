const { Client } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  try {
    if (event.httpMethod === 'GET') {
      const { rows } = await client.query('SELECT * FROM orders ORDER BY id DESC LIMIT 20');
      
      // Parsear items que están guardados como JSON string
      const parsedOrders = rows.map(order => ({
        ...order,
        items: JSON.parse(order.items)
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(parsedOrders)
      };
    }
    
    else if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      if (data.status) {
        // Actualizar estado
        await client.query('UPDATE orders SET status = $1 WHERE id = $2', [data.status, data.id]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      } else {
        // Crear nuevo pedido
        const result = await client.query(
          `INSERT INTO orders (user_id, user_name, user_phone, items, status)
           VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
          [data.user_id, data.user_name, data.user_phone, JSON.stringify(data.items)]
        );
        
        // Reducir stock de productos
        for (const item of data.items) {
          await client.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [item.quantity, item.id]
          );
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, id: result.rows[0].id })
        };
      }
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.end();
  }
};
