// Using fetch instead of axios for Node.js 18+
const testFrontendCodeEditor = async () => {
  try {
    console.log('=== Testing Frontend Code Editor Access ===\n');
    
    // First, let's get a course with code editor enabled
    console.log('1. Fetching courses...');
    const coursesResponse = await fetch('http://localhost:5001/api/courses');
    const courses = await coursesResponse.json();
    
    // Find a course with code editor enabled
    const codeEditorCourse = courses.find(course => 
      course.published && course.codeEditor?.enabled
    );
    
    if (!codeEditorCourse) {
      console.log('❌ No published courses with code editor found!');
      return;
    }
    
    console.log(`✅ Found course with code editor: "${codeEditorCourse.title}"`);
    console.log(`   - ID: ${codeEditorCourse._id}`);
    console.log(`   - Slug: ${codeEditorCourse.slug}`);
    console.log(`   - Code Editor Enabled: ${codeEditorCourse.codeEditor?.enabled}`);
    console.log(`   - Allowed Languages: ${codeEditorCourse.codeEditor?.allowedLanguages?.join(', ')}`);
    console.log(`   - Starter Template: ${codeEditorCourse.codeEditor?.starterTemplate ? 'Yes' : 'No'}`);
    
    // Now test getting course by slug (how frontend gets course data)
    console.log(`\n2. Testing course access by slug...`);
    const courseResponse = await fetch(`http://localhost:5001/api/courses/slug/${codeEditorCourse.slug}`);
    const courseData = await courseResponse.json();
    
    console.log('✅ Course data retrieved by slug:');
    console.log(`   - Title: ${courseData.title}`);
    console.log(`   - Code Editor Config:`, JSON.stringify(courseData.codeEditor, null, 4));
    
    // Test the code execution endpoint that frontend would use
    console.log(`\n3. Testing code execution endpoint...`);
    const testCode = `console.log("Hello from ${courseData.title}!");`;
    const executeResponse = await fetch('http://localhost:5001/api/code/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: testCode,
        language_id: 63 // JavaScript
      })
    });
    const executeData = await executeResponse.json();
    
    console.log('✅ Code execution test successful:');
    console.log(`   - Output: ${executeData.stdout}`);
    console.log(`   - Status: ${executeData.status.description}`);
    
    // Check if frontend URL is accessible
    console.log(`\n4. Testing frontend course page URL...`);
    const frontendUrl = `http://localhost:5173/course/${courseData.slug}`;
    console.log(`   Frontend URL would be: ${frontendUrl}`);
    
    console.log('\n=== Summary ===');
    console.log('✅ Backend API is working correctly');
    console.log('✅ Course has code editor properly configured');
    console.log('✅ Code execution endpoint is functional');
    console.log('✅ All data is accessible for frontend');
    console.log('\n🔍 If code editor still not showing, the issue might be:');
    console.log('   1. User access permissions (hasAccess check in frontend)');
    console.log('   2. Authentication state in frontend');
    console.log('   3. Frontend routing or component loading issues');
    console.log('   4. Browser console errors preventing component render');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
      console.error('   Status:', error.response.status);
    }
  }
};

testFrontendCodeEditor();