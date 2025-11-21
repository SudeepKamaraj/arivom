const http = require('http');

// Test OTP verification
const testData = JSON.stringify({
  email: 'test@example.com',
  otp: '123456' // This will likely fail since we don't have a valid OTP, but will test the endpoint
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/signup/verify-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🧪 Testing OTP verification endpoint...');
console.log(`📡 Sending POST request to http://localhost:5001/api/auth/signup/verify-otp`);

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response:');
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

req.setTimeout(5000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.write(testData);
req.end();