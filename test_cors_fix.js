async function testCORS() {
  console.log('Testing CORS configuration...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint:');
    const healthResponse = await fetch('https://arivom-backend.onrender.com/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test CORS endpoint
    console.log('\n2. Testing CORS endpoint:');
    const corsResponse = await fetch('https://arivom-backend.onrender.com/api/cors-test');
    const corsData = await corsResponse.json();
    console.log('CORS test:', corsData);
    
    // Test login endpoint with preflight simulation
    console.log('\n3. Testing login endpoint (OPTIONS):');
    const optionsResponse = await fetch('https://arivom-backend.onrender.com/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://arivom.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('OPTIONS Status:', optionsResponse.status);
    console.log('OPTIONS Headers:');
    for (const [key, value] of optionsResponse.headers.entries()) {
      if (key.toLowerCase().includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCORS();