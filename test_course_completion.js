const mongoose = require('mongoose');
const Course = require('./backend/models/Course');
const User = require('./backend/models/User');

// Test script for course completion
async function testCourseCompletion() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course-recommendation', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Test 1: Check if we have courses and users
    console.log('\n=== Test 1: Checking data ===');
    
    const courses = await Course.find();
    const users = await User.find();
    
    console.log(`Found ${courses.length} courses and ${users.length} users`);
    
    if (courses.length === 0) {
      console.log('No courses found. Creating a test course...');
      
      // Create a test course
      const testCourse = new Course({
        title: 'Test Course for Reviews',
        description: 'This is a test course to verify the review system',
        instructor: users[0]?._id || new mongoose.Types.ObjectId(),
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
          }
        ],
        isPublished: true
      });
      
      await testCourse.save();
      console.log('✅ Test course created:', testCourse._id);
    }

    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    // Test 2: Check enrollment status
    console.log('\n=== Test 2: Checking enrollment status ===');
    
    const course = await Course.findOne();
    const user = await User.findOne();
    
    const enrollment = course.enrolledStudents.find(
      es => es.student?.toString() === user._id.toString()
    );
    
    console.log('User enrollment status:', enrollment ? 'Enrolled' : 'Not enrolled');
    
    if (enrollment) {
      console.log('Enrollment details:', {
        progress: enrollment.progress,
        certificateEarned: enrollment.certificateEarned,
        enrolledAt: enrollment.enrolledAt
      });
    }

    // Test 3: Simulate course completion
    console.log('\n=== Test 3: Simulating course completion ===');
    
    if (!enrollment) {
      console.log('Auto-enrolling user...');
      course.enrolledStudents.push({
        student: user._id,
        enrolledAt: new Date(),
        progress: 100,
        completedVideos: [],
        completedAssessments: [],
        certificateEarned: false
      });
    }
    
    // Mark as completed
    const userEnrollment = course.enrolledStudents.find(
      es => es.student?.toString() === user._id.toString()
    );
    
    if (userEnrollment) {
      userEnrollment.certificateEarned = true;
      userEnrollment.certificateEarnedAt = new Date();
      userEnrollment.progress = 100;
      
      await course.save();
      console.log('✅ Course marked as completed');
    }

    console.log('\n🎉 Course completion test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testCourseCompletion();




