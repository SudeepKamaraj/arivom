// Final test script to verify all code editor fixes
const testCases = [
  {
    name: "Python Hello World",
    language_id: 71,
    code: 'print("Hello from Python!")',
    expected: "Hello from Python!"
  },
  {
    name: "JavaScript Hello World", 
    language_id: 63,
    code: 'console.log("Hello from JavaScript!");',
    expected: "Hello from JavaScript!"
  },
  {
    name: "Java Hello World",
    language_id: 62,
    code: 'System.out.println("Hello from Java!");',
    expected: "Hello from Java!"
  },
  {
    name: "Python Math",
    language_id: 71,
    code: 'print("Result:", 2 + 3)',
    expected: "Result: 5"
  },
  {
    name: "JavaScript Math",
    language_id: 63,
    code: 'console.log("Result:", 2 + 3);',
    expected: "Result: 5"
  }
];

async function testCodeEditor() {
  console.log("🚀 Testing Code Editor Complete Functionality\n");
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    try {
      const response = await fetch('http://localhost:5001/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language_id: test.language_id,
          source_code: test.code,
          stdin: ''
        })
      });
      
      const result = await response.json();
      const output = result.stdout?.trim() || '';
      
      if (output.includes(test.expected)) {
        console.log(`✅ ${test.name}: PASSED`);
        console.log(`   Expected: "${test.expected}"`);
        console.log(`   Got: "${output}"`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Expected: "${test.expected}"`);  
        console.log(`   Got: "${output}"`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log(`\n📊 Final Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Code editor is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
  }
}

// Check if running in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment - run the test
  const fetch = require('node-fetch');
  testCodeEditor();
} else {
  console.log('This script should be run in Node.js environment with node-fetch');
}