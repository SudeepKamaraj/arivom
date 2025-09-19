const mongoose = require('mongoose');
const Course = require('./backend/models/Course');
const User = require('./backend/models/User');
const Assessment = require('./backend/models/Assessment');

// Test script for the assessment system
async function testAssessmentSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course-recommendation', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Test 1: Check if we have courses with assessments
    console.log('\n=== Test 1: Checking courses with assessments ===');
    
    const courses = await Course.find();
    console.log(`Found ${courses.length} courses`);
    
    const coursesWithAssessments = courses.filter(course => 
      course.assessments && course.assessments.length > 0
    );
    
    console.log(`Found ${coursesWithAssessments.length} courses with assessments`);
    
    if (coursesWithAssessments.length > 0) {
      const course = coursesWithAssessments[0];
      console.log('Sample course with assessments:');
      console.log('- Title:', course.title);
      console.log('- Assessments count:', course.assessments.length);
      console.log('- First assessment questions:', course.assessments[0].questions?.length || 0);
    }

    // Test 2: Create a test course with assessment if none exist
    if (coursesWithAssessments.length === 0) {
      console.log('\n=== Test 2: Creating test course with assessment ===');
      
      const users = await User.find();
      if (users.length === 0) {
        console.log('No users found. Please create a user first.');
        return;
      }

      const testCourse = new Course({
        title: 'Test Course with Assessment',
        description: 'This is a test course with an assessment to verify the system',
        instructor: users[0]._id,
        category: 'Technology',
        level: 'beginner',
        duration: 120,
        price: 0,
        videos: [
          {
            title: 'Introduction',
            description: 'Course introduction',
            url: '/test-video.mp4',
            duration: 60,
            order: 1
          },
          {
            title: 'Advanced Topics',
            description: 'Advanced course topics',
            url: '/test-video2.mp4',
            duration: 60,
            order: 2
          }
        ],
        assessments: [
          {
            title: 'Final Assessment',
            description: 'Test your knowledge with this assessment',
            questions: [
              {
                question: 'What is the main topic of this course?',
                options: ['Programming', 'Design', 'Marketing', 'Cooking'],
                correctAnswer: 0,
                explanation: 'This course is about programming fundamentals.'
              },
              {
                question: 'How many videos are in this course?',
                options: ['1', '2', '3', '4'],
                correctAnswer: 1,
                explanation: 'This course has 2 videos.'
              },
              {
                question: 'What level is this course?',
                options: ['Advanced', 'Beginner', 'Expert', 'Professional'],
                correctAnswer: 1,
                explanation: 'This course is designed for beginners.'
              }
            ],
            passingScore: 70
          }
        ],
        isPublished: true
      });
      
      await testCourse.save();
      console.log('✅ Test course with assessment created:', testCourse._id);
    }

    // Test 3: Check assessment model
    console.log('\n=== Test 3: Testing assessment model ===');
    
    const assessments = await Assessment.find();
    console.log(`Found ${assessments.length} existing assessments`);

    // Test 4: Create a test assessment result
    console.log('\n=== Test 4: Creating test assessment result ===');
    
    const course = await Course.findOne({ assessments: { $exists: true, $not: { $size: 0 } } });
    const user = await User.findOne();
    
    if (course && user) {
      const testAssessment = new Assessment({
        userId: user._id,
        courseId: course._id,
        score: 85,
        passed: true,
        totalQuestions: 3,
        correctAnswers: 2,
        timeTaken: 300, // 5 minutes
        answers: [0, 1, 1], // User's answers
        questions: course.assessments[0].questions,
        completedAt: new Date(),
        status: 'passed'
      });
      
      await testAssessment.save();
      console.log('✅ Test assessment result created:', testAssessment._id);
    }

    console.log('\n🎉 Assessment system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testAssessmentSystem();




