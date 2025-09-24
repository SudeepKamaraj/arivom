// Test script to check course API response
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001/api';

async function testCourseAPI() {
  try {
    console.log('🔍 Testing Course API Response\n');
    
    // Get all courses
    console.log('1. Fetching all courses...');
    const coursesResponse = await fetch(`${API_BASE}/courses`);
    const courses = await coursesResponse.json();
    
    console.log(`Found ${courses.length} published courses:\n`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Published: ${course.isPublished}`);
      console.log(`   Price: ${course.price}`);
      console.log(`   Code Editor Enabled: ${course.codeEditor?.enabled || false}`);
      
      if (course.codeEditor?.enabled) {
        console.log(`   ✅ Code Editor Config:`, {
          supportedLanguages: course.codeEditor.supportedLanguages,
          defaultLanguage: course.codeEditor.defaultLanguage,
          defaultCode: course.codeEditor.defaultCode ? 'Has default code' : 'No default code'
        });
      }
      console.log('');
    });
    
    // Test specific course detail if we have courses
    if (courses.length > 0) {
      const testCourse = courses[0];
      console.log(`\n2. Testing course detail for: ${testCourse.title}`);
      
      const courseDetailResponse = await fetch(`${API_BASE}/courses/${testCourse._id}`);
      const courseDetail = await courseDetailResponse.json();
      
      console.log('Course detail response:');
      console.log(`   Title: ${courseDetail.title}`);
      console.log(`   Code Editor Config:`, courseDetail.codeEditor);
      console.log(`   Code Editor Enabled: ${courseDetail.codeEditor?.enabled || false}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing course API:', error.message);
    console.log('\nMake sure the backend server is running on http://localhost:5001');
  }
}

testCourseAPI();