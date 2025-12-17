const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-recommendation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestCourse() {
  try {
    console.log('🚀 Creating Free Test Course with Code Editor\n');
    
    // Find the first user to set as instructor
    const User = require('./models/User');
    const firstUser = await User.findOne({});
    
    if (!firstUser) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }
    
    console.log(`📋 Using instructor: ${firstUser.firstName} ${firstUser.lastName} (${firstUser.email})`);
    
    const testCourse = new Course({
      title: "JavaScript Fundamentals - Free with Code Editor",
      description: "Learn JavaScript basics with our interactive code editor. This is a free course to test the code editor functionality. Practice writing JavaScript code directly in your browser!",
      category: "Programming",
      level: "beginner",
      price: 0, // FREE COURSE
      duration: 120,
      thumbnail: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=JavaScript+Course",
      tags: ["javascript", "programming", "web development", "coding", "beginner", "free"],
      instructor: firstUser._id, // Set instructor ID
      instructorName: `${firstUser.firstName} ${firstUser.lastName}`,
      isPublished: true, // PUBLISHED
      
      // Code Editor Configuration - ENABLED
      codeEditor: {
        enabled: true,
        supportedLanguages: ["javascript", "python", "java", "cpp", "c", "typescript"],
        defaultLanguage: "javascript",
        defaultCode: `// Welcome to JavaScript Fundamentals!
// This is your interactive code editor where you can practice JavaScript.

// Let's start with a simple example
function greetStudent(name) {
    return "Hello, " + name + "! Welcome to JavaScript programming!";
}

// Try calling the function
console.log(greetStudent("Student"));

// Practice variables
let courseName = "JavaScript Fundamentals";
let isEasyToLearn = true;

console.log("Course: " + courseName);
console.log("Is easy to learn: " + isEasyToLearn);

// Try modifying this code and click 'Run Code' to see the output!

// Challenge: Create a function that adds two numbers
function addNumbers(a, b) {
    // Your code here
    return a + b;
}

console.log("5 + 3 =", addNumbers(5, 3));`,
        allowExecution: true,
        showThemes: true
      },
      
      // Add some sample videos
      videos: [
        {
          title: "Introduction to JavaScript",
          description: "Learn the basics of JavaScript programming",
          url: "https://example.com/video1",
          duration: 30,
          thumbnail: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Lesson+1",
          order: 1
        },
        {
          title: "Variables and Data Types",
          description: "Understanding JavaScript variables",
          url: "https://example.com/video2", 
          duration: 45,
          thumbnail: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Lesson+2",
          order: 2
        },
        {
          title: "Functions and Control Flow",
          description: "JavaScript functions and if/else statements",
          url: "https://example.com/video3",
          duration: 45,
          thumbnail: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Lesson+3", 
          order: 3
        }
      ],
      
      // Course stats
      students: 0,
      rating: 4.8,
      enrolledStudents: []
    });

    await testCourse.save();
    
    console.log('✅ Successfully created free test course!');
    console.log(`📋 Course Details:`);
    console.log(`   Title: ${testCourse.title}`);
    console.log(`   ID: ${testCourse._id}`);
    console.log(`   Price: ₹${testCourse.price} (FREE)`);
    console.log(`   Published: ${testCourse.isPublished}`);
    console.log(`   Code Editor Enabled: ${testCourse.codeEditor.enabled}`);
    console.log(`   Supported Languages: ${testCourse.codeEditor.supportedLanguages.join(', ')}`);
    console.log(`   Default Language: ${testCourse.codeEditor.defaultLanguage}`);
    console.log('');
    console.log('🎯 You can now:');
    console.log('   1. Visit your course dashboard');
    console.log('   2. Find the course "JavaScript Fundamentals - Free with Code Editor"');
    console.log('   3. Click on it to access the course');
    console.log('   4. The code editor should appear below the course description');
    console.log('');
    console.log('💡 Since this is a free course, the code editor will be immediately accessible!');
    
  } catch (error) {
    console.error('❌ Error creating test course:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestCourse();