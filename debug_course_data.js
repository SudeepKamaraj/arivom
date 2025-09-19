const mongoose = require('mongoose');
const Course = require('./backend/models/Course');
const User = require('./backend/models/User');

// Debug script to check course data structure
async function debugCourseData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course-recommendation', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check all courses
    console.log('\n=== Checking all courses ===');
    const courses = await Course.find();
    console.log(`Found ${courses.length} courses`);

    courses.forEach((course, index) => {
      console.log(`\nCourse ${index + 1}:`);
      console.log('- ID:', course._id);
      console.log('- Title:', course.title);
      console.log('- Has assessments:', course.assessments ? course.assessments.length : 0);
      console.log('- Has videos:', course.videos ? course.videos.length : 0);
      console.log('- Is published:', course.isPublished);
      
      if (course.assessments && course.assessments.length > 0) {
        console.log('- Assessment details:');
        course.assessments.forEach((assessment, aIndex) => {
          console.log(`  Assessment ${aIndex + 1}:`);
          console.log(`    - Title: ${assessment.title}`);
          console.log(`    - Questions: ${assessment.questions ? assessment.questions.length : 0}`);
          console.log(`    - Passing score: ${assessment.passingScore}`);
        });
      }
    });

    // Check users
    console.log('\n=== Checking users ===');
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      console.log('Sample user:', {
        id: users[0]._id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role
      });
    }

    // Create a test course with proper assessment if none exist
    if (courses.length === 0 || !courses.some(c => c.assessments && c.assessments.length > 0)) {
      console.log('\n=== Creating test course with assessment ===');
      
      const testCourse = new Course({
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        instructor: users[0]?._id || new mongoose.Types.ObjectId(),
        category: 'Programming',
        level: 'beginner',
        duration: 180,
        price: 0,
        videos: [
          {
            title: 'Introduction to JavaScript',
            description: 'Basic concepts and syntax',
            url: '/videos/js-intro.mp4',
            duration: 30,
            order: 1
          },
          {
            title: 'Variables and Data Types',
            description: 'Understanding variables and data types',
            url: '/videos/js-variables.mp4',
            duration: 25,
            order: 2
          },
          {
            title: 'Functions and Scope',
            description: 'Working with functions and scope',
            url: '/videos/js-functions.mp4',
            duration: 35,
            order: 3
          }
        ],
        assessments: [
          {
            title: 'JavaScript Fundamentals Quiz',
            description: 'Test your understanding of JavaScript basics',
            questions: [
              {
                question: 'What is JavaScript?',
                options: [
                  'A programming language',
                  'A markup language',
                  'A styling language',
                  'A database language'
                ],
                correctAnswer: 0,
                explanation: 'JavaScript is a programming language used for web development.'
              },
              {
                question: 'Which keyword is used to declare a variable in JavaScript?',
                options: ['var', 'let', 'const', 'All of the above'],
                correctAnswer: 3,
                explanation: 'JavaScript supports var, let, and const for variable declaration.'
              },
              {
                question: 'What is the result of 2 + "2" in JavaScript?',
                options: ['4', '22', 'Error', 'NaN'],
                correctAnswer: 1,
                explanation: 'JavaScript performs type coercion, converting 2 to string and concatenating.'
              }
            ],
            passingScore: 70
          }
        ],
        isPublished: true,
        skills: ['JavaScript', 'Programming', 'Web Development'],
        tags: ['javascript', 'programming', 'web']
      });
      
      await testCourse.save();
      console.log('✅ Test course created with ID:', testCourse._id);
    }

    console.log('\n🎉 Course data debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the debug
debugCourseData();

