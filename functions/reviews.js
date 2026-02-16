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
      const { id } = event.queryStringParameters;
      const { rows } = await client.query(
        'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
        [id]
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rows)
      };
    }
    
    else if (event.httpMethod === 'POST') {
      const review = JSON.parse(event.body);
      
      await client.query(
        `INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [review.product_id, review.user_id, review.user_name, review.rating, review.comment]
      );
      
      // Actualizar rating promedio
      const avg = await client.query(
        'SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = $1',
        [review.product_id]
      );
      
      await client.query(
        'UPDATE products SET rating = $1, reviews_count = $2 WHERE id = $3',
        [avg.rows[0].avg, avg.rows[0].count, review.product_id]
      );
      
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
