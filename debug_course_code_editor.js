// Debug course data to see what's actually stored
const testCourseData = async () => {
  try {
    console.log('=== Debugging Course Data ===\n');
    
    const coursesResponse = await fetch('http://localhost:5001/api/courses');
    const courses = await coursesResponse.json();
    
    console.log(`Found ${courses.length} total courses\n`);
    
    courses.forEach((course, index) => {
      console.log(`Course ${index + 1}:`);
      console.log(`  - Title: ${course.title}`);
      console.log(`  - Published: ${course.published}`);
      console.log(`  - Has codeEditor field: ${course.codeEditor ? 'Yes' : 'No'}`);
      if (course.codeEditor) {
        console.log(`  - CodeEditor enabled: ${course.codeEditor.enabled}`);
        console.log(`  - CodeEditor config:`, JSON.stringify(course.codeEditor, null, 6));
      }
      console.log('');
    });
    
    // Look for published courses specifically
    const publishedCourses = courses.filter(course => course.published);
    console.log(`\nPublished courses: ${publishedCourses.length}`);
    
    // Look for any courses with codeEditor field
    const coursesWithCodeEditor = courses.filter(course => course.codeEditor);
    console.log(`Courses with codeEditor field: ${coursesWithCodeEditor.length}`);
    
    // Look for courses with enabled code editor
    const coursesWithEnabledCodeEditor = courses.filter(course => 
      course.codeEditor && course.codeEditor.enabled === true
    );
    console.log(`Courses with enabled code editor: ${coursesWithEnabledCodeEditor.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testCourseData();