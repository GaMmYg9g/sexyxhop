const { Client } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Solo permitir GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  const client = new Client(process.env.DATABASE_URL);
  
  try {
    await client.connect();

    // Obtener estadísticas
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    const ordersResult = await client.query('SELECT COUNT(*) as count FROM orders');
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    const lowStockResult = await client.query('SELECT COUNT(*) as count FROM products WHERE stock < 5');

    const stats = {
      products: parseInt(productsResult.rows[0].count),
      orders: parseInt(ordersResult.rows[0].count),
      users: parseInt(usersResult.rows[0].count),
      low_stock: parseInt(lowStockResult.rows[0].count)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats)
    };

  } catch (error) {
    console.error('Error en stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error al obtener estadísticas',
        details: error.message 
      })
    };
  } finally {
    await client.end();
  }
};
