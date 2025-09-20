const mongoose = require('mongoose');
const Course = require('./backend/models/Course');
const User = require('./backend/models/User');
const Review = require('./backend/models/Review');

// Test script for the review button functionality
async function testReviewButton() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course-recommendation', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Test 1: Check if we have users and courses
    console.log('\n=== Test 1: Checking basic data ===');
    
    const users = await User.find();
    const courses = await Course.find();
    
    console.log(`Found ${users.length} users`);
    console.log(`Found ${courses.length} courses`);
    
    if (users.length === 0 || courses.length === 0) {
      console.log('❌ Need at least one user and one course for testing');
      return;
    }

    const testUser = users[0];
    const testCourse = courses[0];
    
    console.log(`Test User: ${testUser.username} (${testUser._id})`);
    console.log(`Test Course: ${testCourse.title} (${testCourse._id})`);

    // Test 2: Check enrollment status
    console.log('\n=== Test 2: Checking enrollment ===');
    
    const enrollment = testCourse.enrolledStudents.find(
      es => es.student?.toString() === testUser._id.toString()
    );
    
    if (!enrollment) {
      console.log('❌ User is not enrolled. Let me enroll them...');
      
      // Auto-enroll for testing
      testCourse.enrolledStudents.push({
        student: testUser._id,
        enrolledAt: new Date(),
        progress: 75, // Set to 75% to meet review requirements
        completedVideos: [],
        completedAssessments: [],
        certificateEarned: false
      });
      
      await testCourse.save();
      console.log('✅ User enrolled with 75% progress');
    } else {
      console.log(`✅ User is enrolled with ${enrollment.progress}% progress`);
      
      // Update progress to 75% if it's less
      if (enrollment.progress < 50) {
        enrollment.progress = 75;
        await testCourse.save();
        console.log('✅ Updated progress to 75%');
      }
    }

    // Test 3: Check if user can review
    console.log('\n=== Test 3: Checking review eligibility ===');
    
    const canReview = await Review.canUserReview(testUser._id, testCourse._id);
    console.log('Can review result:', canReview);
    
    if (canReview.canReview) {
      console.log('✅ User can submit a review');
    } else {
      console.log(`❌ User cannot review: ${canReview.reason}`);
    }

    // Test 4: Check existing reviews
    console.log('\n=== Test 4: Checking existing reviews ===');
    
    const existingReviews = await Review.find({ course: testCourse._id })
      .populate('user', 'username firstName lastName');
    
    console.log(`Found ${existingReviews.length} existing reviews for this course`);
    existingReviews.forEach((review, index) => {
      console.log(`Review ${index + 1}: ${review.rating}/5 by ${review.user.username} - "${review.title}"`);
    });

    // Test 5: Create a test review (if user can review)
    if (canReview.canReview) {
      console.log('\n=== Test 5: Creating test review ===');
      
      try {
        const testReview = new Review({
          course: testCourse._id,
          user: testUser._id,
          rating: 5,
          title: 'Test Review for Button Functionality',
          comment: 'This is a test review created to verify the review button is working correctly. The course content is excellent and well-structured.',
          isVerified: true
        });

        await testReview.save();
        console.log('✅ Test review created successfully');
        console.log(`Review ID: ${testReview._id}`);
        
        // Clean up - remove the test review
        await Review.findByIdAndDelete(testReview._id);
        console.log('✅ Test review cleaned up');
        
      } catch (error) {
        console.log('❌ Failed to create test review:', error.message);
      }
    }

    console.log('\n=== Review Button Test Complete ===');
    console.log(`Frontend should be able to:`);
    console.log(`1. POST to http://localhost:5000/api/reviews`);
    console.log(`2. Send courseId: ${testCourse._id}`);
    console.log(`3. Include Authorization header with Bearer token`);
    console.log(`4. Review form should work if user has progress >= 50%`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the test
testReviewButton();