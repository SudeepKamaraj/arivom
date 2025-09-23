const mongoose = require('mongoose');
const Course = require('./models/Course');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/course-recommendation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkAndFixCodeEditor() {
  try {
    console.log('Checking courses with code editor...');
    
    // Find courses with code editor enabled
    const coursesWithCodeEditor = await Course.find({ 'codeEditor.enabled': true });
    console.log(`Found ${coursesWithCodeEditor.length} courses with code editor enabled`);
    
    if (coursesWithCodeEditor.length === 0) {
      console.log('No courses found with code editor enabled. Creating/updating some...');
      
      // Find first few courses and enable code editor for them
      const courses = await Course.find().limit(3);
      
      for (let course of courses) {
        course.codeEditor = {
          enabled: true,
          supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
          defaultLanguage: 'javascript',
          defaultCode: `// Welcome to ${course.title} - Interactive Code Editor
console.log("Hello, World!");

function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("Programmer"));`,
          allowExecution: true,
          showThemes: true
        };
        
        await course.save();
        console.log(`Enabled code editor for course: ${course.title}`);
      }
    }
    
    // Also make sure some courses are free for testing
    await Course.updateMany(
      { price: { $gt: 0 } },
      { price: 0 },
      { limit: 2 }
    );
    
    console.log('Updated some courses to be free for testing');
    
    // Show final status
    const finalCount = await Course.countDocuments({ 'codeEditor.enabled': true });
    const freeCount = await Course.countDocuments({ price: 0 });
    
    console.log(`Final status:`);
    console.log(`- Courses with code editor: ${finalCount}`);
    console.log(`- Free courses: ${freeCount}`);
    
    console.log('Done! Code editor should now be visible in the frontend.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkAndFixCodeEditor();