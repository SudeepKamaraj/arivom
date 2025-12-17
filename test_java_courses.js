// Check Java courses and their code editor configuration
const checkJavaCourses = async () => {
  try {
    console.log('=== Checking Java Course Code Editor ===\n');
    
    // Get all published courses
    const coursesResponse = await fetch('http://localhost:5001/api/courses');
    const courses = await coursesResponse.json();
    
    console.log(`Found ${courses.length} published courses\n`);
    
    // Filter courses with Java support
    const javaCourses = courses.filter(course => 
      course.codeEditor && 
      course.codeEditor.enabled && 
      course.codeEditor.supportedLanguages.includes('java')
    );
    
    console.log(`Courses with Java code editor: ${javaCourses.length}\n`);
    
    for (const course of javaCourses) {
      console.log(`📚 Course: "${course.title}"`);
      console.log(`   - ID: ${course._id}`);
      console.log(`   - Code Editor Enabled: ${course.codeEditor.enabled}`);
      console.log(`   - Supported Languages: ${course.codeEditor.supportedLanguages.join(', ')}`);
      console.log(`   - Default Language: ${course.codeEditor.defaultLanguage}`);
      console.log(`   - Has Default Code: ${course.codeEditor.defaultCode ? 'Yes' : 'No'}`);
      console.log(`   - Frontend URL: http://localhost:5173/courses/${course._id}`);
      
      if (course.codeEditor.defaultCode) {
        console.log(`   - Default Code Preview:`);
        console.log(`     ${course.codeEditor.defaultCode.substring(0, 100)}${course.codeEditor.defaultCode.length > 100 ? '...' : ''}`);
      }
      
      // Test Java code execution for this course context
      console.log(`\n   🧪 Testing Java execution:`);
      try {
        const testJavaCode = `
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello from ${course.title}!");
        System.out.println("Java is working correctly!");
    }
}`.trim();

        const executeResponse = await fetch('http://localhost:5001/api/code/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_code: testJavaCode,
            language_id: 62 // Java
          })
        });
        
        const result = await executeResponse.json();
        
        if (result.status && result.status.id === 3) {
          console.log(`   ✅ Java execution successful:`);
          console.log(`      Output: ${result.stdout?.replace(/\n/g, '\\n')}`);
        } else {
          console.log(`   ❌ Java execution failed:`);
          console.log(`      Status: ${result.status?.description}`);
          if (result.stderr) console.log(`      Error: ${result.stderr}`);
          if (result.compile_output) console.log(`      Compile Error: ${result.compile_output}`);
        }
      } catch (error) {
        console.log(`   ❌ Java execution error: ${error.message}`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    // Also check courses that might be Java-specific but not properly configured
    const allCourses = courses.filter(course => 
      course.title.toLowerCase().includes('java') || 
      course.description?.toLowerCase().includes('java')
    );
    
    if (allCourses.length > javaCourses.length) {
      console.log('🔍 Other Java-related courses found:');
      allCourses.forEach(course => {
        if (!javaCourses.find(jc => jc._id === course._id)) {
          console.log(`   - "${course.title}" (Code Editor: ${course.codeEditor?.enabled ? 'Enabled' : 'Disabled'})`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkJavaCourses();