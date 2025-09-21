// Test API to check code editor configuration
const axios = require('axios');

async function testJavaCourseAPI() {
  try {
    console.log('🧪 Testing Java course API...');
    
    // Test courses list API
    const response = await axios.get('http://localhost:5001/api/courses');
    const courses = response.data;
    
    console.log(`📋 Found ${courses.length} courses`);
    
    const javaCourse = courses.find(course => 
      course.title.toLowerCase().includes('java')
    );
    
    if (javaCourse) {
      console.log('✅ Java course found:', {
        id: javaCourse._id,
        title: javaCourse.title,
        codeEditor: javaCourse.codeEditor
      });
      
      // Test individual course API
      const courseResponse = await axios.get(`http://localhost:5001/api/courses/${javaCourse._id}`);
      const courseDetail = courseResponse.data;
      
      console.log('🔍 Course detail API response:', {
        title: courseDetail.title,
        hasCodeEditor: !!courseDetail.codeEditor,
        codeEditorEnabled: courseDetail.codeEditor?.enabled,
        supportedLanguages: courseDetail.codeEditor?.supportedLanguages
      });
      
      if (courseDetail.codeEditor && courseDetail.codeEditor.enabled) {
        console.log('🎉 Code editor is properly configured!');
        console.log('📝 Default code preview:', courseDetail.codeEditor.defaultCode?.substring(0, 100) + '...');
      } else {
        console.log('❌ Code editor is not enabled or configured');
      }
      
    } else {
      console.log('❌ Java course not found in API response');
      console.log('Available courses:', courses.map(c => c.title));
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testJavaCourseAPI();