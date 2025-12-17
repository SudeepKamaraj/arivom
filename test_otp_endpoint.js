const http = require('http');

// Test data for OTP request
const postData = JSON.stringify({
  name: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'testpassword123',
  confirmPassword: 'testpassword123'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/signup/request-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing OTP endpoint...');
console.log(`📡 Sending POST request to http://localhost:5001/api/auth/signup/request-otp`);

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();