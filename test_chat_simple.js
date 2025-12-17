const http = require('http');

const testData = JSON.stringify({
  message: 'Hello, I want to learn programming'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/chat/public',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🧪 Testing Public Chat Endpoint...\n');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response received:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
    
    // Test teacher endpoint
    testTeacherEndpoint();
  });
});

req.on('error', (e) => {
  console.log('❌ Error:', e.message);
  console.log('Server might be down');
});

req.write(testData);
req.end();

function testTeacherEndpoint() {
  console.log('\n🎓 Testing Teacher Chat Endpoint...\n');
  
  const teacherData = JSON.stringify({
    message: 'I want to learn JavaScript, can you help me create a study plan?'
  });
  
  const teacherOptions = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/chat/teacher',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(teacherData)
    }
  };
  
  const teacherReq = http.request(teacherOptions, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Teacher Response received:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
      console.log('\n🏁 All tests completed!');
    });
  });
  
  teacherReq.on('error', (e) => {
    console.log('❌ Teacher endpoint error:', e.message);
  });
  
  teacherReq.write(teacherData);
  teacherReq.end();
}