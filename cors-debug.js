// CORS Debug Utility
// Add this to your browser console to test CORS connection

const testCORS = async () => {
  const backendUrl = 'https://arivom-backend.onrender.com';
  
  console.log('🧪 Testing CORS connection to backend...');
  console.log('Frontend URL:', window.location.origin);
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test 1: Simple GET request
    console.log('\n1️⃣ Testing simple GET request...');
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check successful:', healthData);
    
    // Test 2: CORS test endpoint
    console.log('\n2️⃣ Testing CORS endpoint...');
    const corsResponse = await fetch(`${backendUrl}/api/cors-test`);
    const corsData = await corsResponse.json();
    console.log('✅ CORS test successful:', corsData);
    
    // Test 3: POST request (like login)
    console.log('\n3️⃣ Testing POST request...');
    const postResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test'
      })
    });
    
    if (postResponse.status === 400 || postResponse.status === 401) {
      console.log('✅ POST request successful (expected auth error)');
    } else {
      console.log('✅ POST request successful:', await postResponse.json());
    }
    
    console.log('\n🎉 All CORS tests passed!');
    
  } catch (error) {
    console.error('❌ CORS test failed:', error);
    console.log('\n🔍 Debugging tips:');
    console.log('1. Check if backend is running');
    console.log('2. Verify CORS configuration in server.js');
    console.log('3. Check browser network tab for details');
  }
};

// Run the test
testCORS();