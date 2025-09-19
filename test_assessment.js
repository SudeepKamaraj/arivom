// Test script to verify assessment system functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testAssessmentSystem() {
  console.log('🧪 Testing Assessment System...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Create a test course with assessment
    console.log('\n2. Testing course creation with assessment...');
    const testCourse = {
      title: 'Test Course with Assessment',
      description: 'A test course to verify assessment functionality',
      category: 'Testing',
      level: 'beginner',
      duration: 120,
      thumbnail: 'https://example.com/thumbnail.jpg',
      tags: ['test', 'assessment'],
      isPublished: true,
      instructorName: 'Test Instructor',
      videos: [
        {
          title: 'Introduction',
          description: 'Course introduction',
          url: 'https://example.com/video1.mp4',
          duration: 300,
          thumbnail: 'https://example.com/thumb1.jpg',
          order: 1
        }
      ],
      assessments: [
        {
          title: 'Final Assessment',
          description: 'Test assessment for the course',
          questions: [
            {
              question: 'What is the main topic of this course?',
              options: [
                'Testing and Assessment',
                'Cooking',
                'Sports',
                'Music'
              ],
              correctAnswer: 0,
              explanation: 'This course focuses on testing and assessment functionality.'
            },
            {
              question: 'How many questions are in this assessment?',
              options: [
                '2 questions',
                '5 questions',
                '10 questions',
                '1 question'
              ],
              correctAnswer: 0,
              explanation: 'This assessment has 2 questions.'
            }
          ],
          passingScore: 70
        }
      ]
    };

    const courseResponse = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You'll need a real token
      },
      body: JSON.stringify(testCourse)
    });

    if (courseResponse.ok) {
      const courseData = await courseResponse.json();
      console.log('✅ Course created:', courseData.title);
      console.log('   Assessments:', courseData.assessments?.length || 0);
      console.log('   Questions:', courseData.assessments?.[0]?.questions?.length || 0);
    } else {
      console.log('❌ Course creation failed:', await courseResponse.text());
    }

    // Test 3: Get courses to verify assessment data
    console.log('\n3. Testing course retrieval...');
    const coursesResponse = await fetch(`${BASE_URL}/courses`);
    const coursesData = await coursesResponse.json();
    
    const testCourseFromDB = coursesData.find(c => c.title === 'Test Course with Assessment');
    if (testCourseFromDB) {
      console.log('✅ Course retrieved:', testCourseFromDB.title);
      console.log('   Assessments:', testCourseFromDB.assessments?.length || 0);
      console.log('   Questions:', testCourseFromDB.assessments?.[0]?.questions?.length || 0);
    } else {
      console.log('❌ Test course not found in database');
    }

    console.log('\n🎉 Assessment system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAssessmentSystem();
