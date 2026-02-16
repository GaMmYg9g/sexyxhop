const { Client } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  try {
    if (event.httpMethod === 'GET') {
      const { rows } = await client.query('SELECT * FROM products ORDER BY id DESC');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rows)
      };
    }
    
    else if (event.httpMethod === 'POST') {
      const product = JSON.parse(event.body);
      
      if (product.id) {
        await client.query(
          `UPDATE products SET 
            name = $1, price = $2, stock = $3, category = $4, 
            image = $5, description = $6, commission_type = $7, commission_value = $8
          WHERE id = $9`,
          [product.name, product.price, product.stock, product.category,
           product.image, product.description, product.commission_type,
           product.commission_value, product.id]
        );
      } else {
        await client.query(
          `INSERT INTO products 
            (name, price, stock, category, image, description, commission_type, commission_value)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [product.name, product.price, product.stock, product.category,
           product.image, product.description, product.commission_type,
           product.commission_value]
        );
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
    
    else if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters.id;
      await client.query('DELETE FROM products WHERE id = $1', [id]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
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
