// Test both code editor issues are fixed
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testCodeEditorFixes() {
  console.log('Testing Code Editor Fixes...\n');
  
  // Test 1: Code execution without authentication (mock mode)
  console.log('1. Testing code execution (mock mode)...');
  try {
    const response = await axios.post(`${API_BASE_URL}/code/execute`, {
      language_id: 63,
      source_code: 'console.log("Hello from test!");',
      stdin: ''
    });
    
    console.log('✅ Code execution successful');
    console.log('   Output:', response.data.stdout);
    console.log('   Status:', response.data.status.description);
  } catch (error) {
    console.log('❌ Code execution failed:', error.message);
  }
  
  // Test 2: Language configuration API
  console.log('\n2. Testing language configuration...');
  try {
    const response = await axios.get(`${API_BASE_URL}/code/languages`);
    console.log('✅ Languages API working');
    console.log('   Available languages:', response.data.length);
    console.log('   Sample languages:', response.data.slice(0, 3).map(l => l.name));
  } catch (error) {
    console.log('❌ Languages API failed:', error.message);
  }
  
  // Test 3: Course with codeEditor configuration
  console.log('\n3. Testing course codeEditor configuration...');
  try {
    const response = await axios.get(`${API_BASE_URL}/courses`);
    const courseWithCodeEditor = response.data.find(course => 
      course.codeEditor && course.codeEditor.enabled
    );
    
    if (courseWithCodeEditor) {
      console.log('✅ Found course with code editor enabled');
      console.log('   Course:', courseWithCodeEditor.title);
      console.log('   Supported languages:', courseWithCodeEditor.codeEditor.supportedLanguages.length);
      console.log('   Languages:', courseWithCodeEditor.codeEditor.supportedLanguages.slice(0, 5));
    } else {
      console.log('❌ No course with code editor found');
    }
  } catch (error) {
    console.log('❌ Course API failed:', error.message);
  }
  
  console.log('\n✅ All tests completed!');
  console.log('\nExpected results:');
  console.log('- Code execution should work without authentication in mock mode');
  console.log('- Languages API should return 50+ available languages');
  console.log('- Courses should have codeEditor configurations with supported languages');
}

testCodeEditorFixes();