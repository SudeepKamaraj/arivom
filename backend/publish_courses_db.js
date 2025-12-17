// Direct MongoDB update to publish courses with code editor
const mongoose = require('mongoose');
const Course = require('./models/Course');

const updateCoursesToPublished = async () => {
  try {
    console.log('=== Publishing Courses with Code Editor ===\n');
    
    // Connect to MongoDB Atlas (using the same connection as the server)
    require('dotenv').config();
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // First, let's see all courses
    const allCourses = await Course.find({});
    console.log(`Total courses in database: ${allCourses.length}`);
    
    allCourses.forEach((course, index) => {
      console.log(`Course ${index + 1}:`);
      console.log(`  - Title: ${course.title}`);
      console.log(`  - isPublished: ${course.isPublished}`);
      console.log(`  - Has codeEditor: ${course.codeEditor ? 'Yes' : 'No'}`);
      if (course.codeEditor) {
        console.log(`  - Code Editor enabled: ${course.codeEditor.enabled}`);
      }
      console.log('');
    });
    
    // Find all courses with code editor enabled that aren't published
    const unpublishedCodeEditorCourses = await Course.find({
      'codeEditor.enabled': true,
      $or: [
        { isPublished: false },
        { isPublished: { $exists: false } }
      ]
    });
    
    console.log(`Found ${unpublishedCodeEditorCourses.length} courses with code editor that need publishing\n`);
    
    // Update each course to be published
    for (const course of unpublishedCodeEditorCourses) {
      console.log(`Publishing: "${course.title}"`);
      console.log(`  - ID: ${course._id}`);
      console.log(`  - Slug: ${course.slug}`);
      console.log(`  - Code Editor Languages: ${course.codeEditor.supportedLanguages.join(', ')}`);
      
      await Course.findByIdAndUpdate(course._id, { isPublished: true });
      console.log(`  ✅ Published successfully!\n`);
    }
    
    // Verify the update
    const publishedCourses = await Course.find({ isPublished: true });
    const publishedWithCodeEditor = publishedCourses.filter(course => 
      course.codeEditor && course.codeEditor.enabled
    );
    
    console.log('=== Verification ===');
    console.log(`Total published courses: ${publishedCourses.length}`);
    console.log(`Published courses with code editor: ${publishedWithCodeEditor.length}`);
    
    if (publishedWithCodeEditor.length > 0) {
      console.log('\n✅ Successfully published courses with code editor:');
      publishedWithCodeEditor.forEach(course => {
        console.log(`  - "${course.title}" (${course.slug})`);
      });
      
      console.log('\n🎉 Code editor should now be visible in these courses!');
      console.log('Frontend URLs to test:');
      publishedWithCodeEditor.forEach(course => {
        console.log(`  - http://localhost:5173/course/${course.slug}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

updateCoursesToPublished();