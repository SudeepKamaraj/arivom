// Simple test with error logging
const http = require('http');

const req = http.get('http://localhost:5001/api/health', (res) => {
  console.log('✅ Connected! Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => {
  console.error('❌ Error details:', e.code, e.message);
  console.error('Full error:', e);
});

req.setTimeout(5000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});
