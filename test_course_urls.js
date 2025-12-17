// Test getting courses by slug to get proper URLs
const testCourseUrls = async () => {
  try {
    console.log('=== Testing Course URLs ===\n');
    
    // Get all published courses
    const coursesResponse = await fetch('http://localhost:5001/api/courses');
    const courses = await coursesResponse.json();
    
    console.log(`Found ${courses.length} published courses\n`);
    
    // Filter courses with code editor
    const codeEditorCourses = courses.filter(course => 
      course.codeEditor && course.codeEditor.enabled
    );
    
    console.log(`Courses with code editor: ${codeEditorCourses.length}\n`);
    
    for (const course of codeEditorCourses) {
      console.log(`Course: "${course.title}"`);
      console.log(`  - ID: ${course._id}`);
      console.log(`  - Slug: ${course.slug || 'No slug found'}`);
      console.log(`  - Published: ${course.isPublished}`);
      console.log(`  - Code Editor Enabled: ${course.codeEditor.enabled}`);
      console.log(`  - Supported Languages: ${course.codeEditor.supportedLanguages.join(', ')}`);
      
      if (course.slug) {
        console.log(`  - Frontend URL: http://localhost:5173/course/${course.slug}`);
        
        // Test the slug API
        try {
          const slugResponse = await fetch(`http://localhost:5001/api/courses/slug/${course.slug}`);
          if (slugResponse.ok) {
            const courseData = await slugResponse.json();
            console.log(`  ✅ Slug API working - Course accessible by slug`);
            console.log(`  - Code Editor Config: ${JSON.stringify(courseData.codeEditor, null, 2)}`);
          } else {
            console.log(`  ❌ Slug API failed - Status: ${slugResponse.status}`);
          }
        } catch (error) {
          console.log(`  ❌ Slug API error: ${error.message}`);
        }
      } else {
        console.log(`  ❌ No slug found - course may not be accessible via URL`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testCourseUrls();