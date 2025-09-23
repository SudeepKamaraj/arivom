// Simple CORS test that simulates the exact request your frontend makes

async function testLoginCORS() {
  console.log('Testing login endpoint CORS...');
  
  try {
    // First test the preflight request (OPTIONS)
    console.log('\n1. Testing preflight (OPTIONS) request:');
    const optionsResponse = await fetch('https://arivom-backend.onrender.com/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://arivom.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight Status:', optionsResponse.status);
    console.log('Preflight Headers:');
    for (const [key, value] of optionsResponse.headers.entries()) {
      if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('cors')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    // Test actual POST request (this will fail due to no credentials, but CORS should work)
    console.log('\n2. Testing actual POST request:');
    try {
      const postResponse = await fetch('https://arivom-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://arivom.onrender.com'
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      console.log('POST Status:', postResponse.status);
      const result = await postResponse.json();
      console.log('POST Response:', result);
    } catch (postError) {
      console.log('POST request CORS error (expected):', postError.message);
    }
    
  } catch (error) {
    console.error('CORS test failed:', error.message);
  }
}

testLoginCORS();