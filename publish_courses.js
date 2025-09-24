// Let's update the courses to be published so the code editor shows up
const updateCoursesToPublished = async () => {
  try {
    console.log('=== Updating Courses to Published Status ===\n');
    
    // Get all courses (admin view, not filtered by published status)
    const allCoursesResponse = await fetch('http://localhost:5001/api/courses/admin/all', {
      headers: {
        'Authorization': 'Bearer dummy-token-for-testing' // This might need auth
      }
    });
    
    let allCourses;
    if (!allCoursesResponse.ok) {
      console.log('Admin endpoint not accessible, trying to update via database...');
      // Alternative: direct database update
      const directResponse = await fetch('http://localhost:5001/api/debug/courses-raw');
      if (directResponse.ok) {
        allCourses = await directResponse.json();
      } else {
        console.log('❌ Cannot access courses data');
        return;
      }
    } else {
      allCourses = await allCoursesResponse.json();
    }
    
    console.log(`Found ${allCourses?.length || 0} courses to update`);
    
    // Find courses with code editor enabled that aren't published
    if (allCourses) {
      const codeEditorCourses = allCourses.filter(course => 
        course.codeEditor && course.codeEditor.enabled && !course.isPublished
      );
      
      console.log(`\nCourses with code editor that need publishing: ${codeEditorCourses.length}`);
      
      for (const course of codeEditorCourses) {
        console.log(`\nAttempting to publish: "${course.title}"`);
        console.log(`  - Current isPublished: ${course.isPublished}`);
        console.log(`  - Code Editor Enabled: ${course.codeEditor.enabled}`);
        console.log(`  - Languages: ${course.codeEditor.supportedLanguages?.join(', ')}`);
        
        // Try to update the course to published
        const updateResponse = await fetch(`http://localhost:5001/api/courses/${course._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...course,
            isPublished: true
          })
        });
        
        if (updateResponse.ok) {
          console.log(`  ✅ Successfully published!`);
        } else {
          console.log(`  ❌ Failed to publish: ${updateResponse.status}`);
        }
      }
    }
    
    console.log('\n=== Testing Published Courses API ===');
    
    // Now test the published courses API
    const publishedResponse = await fetch('http://localhost:5001/api/courses');
    const publishedCourses = await publishedResponse.json();
    
    console.log(`\nPublished courses now: ${publishedCourses.length}`);
    
    const publishedWithCodeEditor = publishedCourses.filter(course => 
      course.codeEditor && course.codeEditor.enabled
    );
    
    console.log(`Published courses with code editor: ${publishedWithCodeEditor.length}`);
    
    if (publishedWithCodeEditor.length > 0) {
      console.log('\n✅ Success! Courses with code editor are now published:');
      publishedWithCodeEditor.forEach(course => {
        console.log(`  - "${course.title}" (slug: ${course.slug})`);
      });
    } else {
      console.log('\n❌ Still no published courses with code editor found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

updateCoursesToPublished();