// Debug script to test login issue

async function testLogin() {
  const { default: fetch } = await import('node-fetch');
  try {
    console.log('Testing login request...');
   
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'patient@nurox.com',
        password: 'admin123456'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();