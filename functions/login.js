exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { email, password } = JSON.parse(event.body);
    
    // Aquí iría tu conexión a Neon
    // Por ahora, credenciales fijas
    if (email === 'admin@tienda.com' && password === 'admin123') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, name: 'Admin', token: 'real-token' })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
