const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-recommendation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugCodeEditor() {
  try {
    console.log('🔍 Debugging Code Editor Issue\n');
    
    // Get all courses and check their code editor configuration
    const courses = await Course.find({}).select('title codeEditor isPublished createdAt');
    
    console.log(`Found ${courses.length} courses in database:\n`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Published: ${course.isPublished}`);
      console.log(`   Created: ${course.createdAt}`);
      console.log(`   Code Editor Config:`, course.codeEditor);
      console.log(`   Code Editor Enabled: ${course.codeEditor?.enabled || false}`);
      
      if (course.codeEditor?.enabled) {
        console.log(`   ✅ Code editor is enabled`);
        console.log(`   Supported Languages: ${course.codeEditor.supportedLanguages?.join(', ') || 'None'}`);
        console.log(`   Default Language: ${course.codeEditor.defaultLanguage || 'Not set'}`);
      } else {
        console.log(`   ❌ Code editor is disabled or not configured`);
      }
      console.log('');
    });
    
    // Check if there are any recently created courses
    const recentCourses = await Course.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title codeEditor createdAt');
    
    console.log('\n📅 3 Most Recently Created Courses:');
    recentCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.createdAt})`);
      console.log(`   Code Editor: ${JSON.stringify(course.codeEditor, null, 2)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugCodeEditor();