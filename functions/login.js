const { Client } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  try {
    const { email, password } = JSON.parse(event.body);

    const result = await client.query(
      'SELECT id, name, email FROM users WHERE email = $1 AND password = $2 AND is_admin = 1',
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          name: user.name,
          id: user.id,
          token: 'admin-token-' + Date.now()
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: 'Credenciales incorrectas' })
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
