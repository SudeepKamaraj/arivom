const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-recommendation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function enableCodeEditorForAllCourses() {
  try {
    console.log('Updating all courses to enable code editor...');
    
    const result = await Course.updateMany(
      {}, // Update all courses
      {
        $set: {
          'codeEditor.enabled': true,
          'codeEditor.supportedLanguages': ['java', 'javascript', 'python', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust'],
          'codeEditor.defaultLanguage': 'javascript',
          'codeEditor.defaultCode': 'console.log("Hello, World!");',
          'codeEditor.allowExecution': true
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} courses with code editor configuration`);

    // Display all courses with their code editor status
    const courses = await Course.find({}, 'title category codeEditor.enabled codeEditor.supportedLanguages');
    console.log('\n📋 Course Status:');
    courses.forEach(course => {
      console.log(`- ${course.title} (${course.category}): Code Editor ${course.codeEditor?.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    });

  } catch (error) {
    console.error('❌ Error updating courses:', error);
  } finally {
    mongoose.connection.close();
  }
}

enableCodeEditorForAllCourses();