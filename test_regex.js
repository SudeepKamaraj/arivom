// Test regex patterns for code output extraction
const testCases = [
  { code: 'print("Hello from Python!")', lang: 71, expected: "Hello from Python!" },
  { code: "print('Hello from Python!')", lang: 71, expected: "Hello from Python!" },
  { code: 'System.out.println("Hello from Java!");', lang: 62, expected: "Hello from Java!" },
  { code: 'console.log("Hello from JS!");', lang: 63, expected: "Hello from JS!" }
];

testCases.forEach(test => {
  console.log(`\nTesting: ${test.code}`);
  
  if (test.lang === 71) {
    // Python
    const printMatches = test.code.match(/print\(['"`]([^'"`]*)['"`]\)/g);
    console.log('Matches:', printMatches);
    if (printMatches) {
      const content = printMatches.map(match => {
        const extracted = match.match(/print\(['"`]([^'"`]*)['"`]\)/);
        console.log('Extracted:', extracted);
        return extracted ? extracted[1] : '';
      }).join('\n');
      console.log('Final content:', content);
    }
  }
  
  if (test.lang === 63) {
    // JavaScript
    const consoleMatches = test.code.match(/console\.log\(['"`]([^'"`]*)['"`]\)/g);
    console.log('Matches:', consoleMatches);
    if (consoleMatches) {
      const content = consoleMatches.map(match => {
        const extracted = match.match(/console\.log\(['"`]([^'"`]*)['"`]\)/);
        console.log('Extracted:', extracted);
        return extracted ? extracted[1] : '';
      }).join('\n');
      console.log('Final content:', content);
    }
  }
  
  if (test.lang === 62) {
    // Java
    const systemOutMatches = test.code.match(/System\.out\.println\(['"`]([^'"`]*)['"`]\)/g);
    console.log('Matches:', systemOutMatches);
    if (systemOutMatches) {
      const content = systemOutMatches.map(match => {
        const extracted = match.match(/System\.out\.println\(['"`]([^'"`]*)['"`]\)/);
        console.log('Extracted:', extracted);
        return extracted ? extracted[1] : '';
      }).join('\n');
      console.log('Final content:', content);
    }
  }
});