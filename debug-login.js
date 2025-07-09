// Debug script to test login issue

const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login request...');
    
    const response = await fetch('http://192.168.0.102:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chamidu@patient.com',
        password: 'Chamidu@123'
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