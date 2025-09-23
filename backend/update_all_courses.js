const mongoose = require('mongoose');
const Course = require('./models/Course');

// MongoDB connection URI (adjust as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/course-recommendation';

async function updateAllCoursesWithCodeEditor() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all courses to enable code editor
    const result = await Course.updateMany(
      {}, // Empty filter to match all courses
      {
        $set: {
          'codeEditor.enabled': true,
          'codeEditor.supportedLanguages': ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'php', 'ruby', 'rust', 'kotlin', 'typescript'],
          'codeEditor.defaultLanguage': 'javascript',
          'codeEditor.defaultCode': '// Write your code here\nconsole.log("Hello, World!");',
          'codeEditor.allowExecution': true,
          'codeEditor.showThemes': true
        }
      }
    );

    console.log(`✅ Updated ${result.matchedCount} courses`);
    console.log(`✅ Modified ${result.modifiedCount} courses`);

    // Verify the updates
    const courses = await Course.find({}, 'title codeEditor.enabled');
    console.log('\n📋 Course Status:');
    courses.forEach(course => {
      console.log(`- ${course.title}: codeEditor.enabled = ${course.codeEditor.enabled}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error updating courses:', error);
    process.exit(1);
  }
}

updateAllCoursesWithCodeEditor();