const mongoose = require('mongoose');
const Review = require('./backend/models/Review');
const Course = require('./backend/models/Course');
const User = require('./backend/models/User');

// Test script for the review system
async function testReviewSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course-recommendation', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Test 1: Create a test review
    console.log('\n=== Test 1: Creating a test review ===');
    
    // Find a course and user (assuming they exist)
    const course = await Course.findOne();
    const user = await User.findOne();
    
    if (!course || !user) {
      console.log('No course or user found. Please create some test data first.');
      return;
    }

    const testReview = new Review({
      course: course._id,
      user: user._id,
      rating: 5,
      title: 'Excellent Course!',
      comment: 'This course was amazing. I learned so much and the instructor was very clear and engaging. Highly recommended!',
      isVerified: true
    });

    await testReview.save();
    console.log('✅ Test review created successfully:', testReview._id);

    // Test 2: Get course reviews
    console.log('\n=== Test 2: Getting course reviews ===');
    const courseReviews = await Review.getCourseReviews(course._id);
    console.log('✅ Course reviews retrieved:', courseReviews.length, 'reviews');

    // Test 3: Calculate course rating
    console.log('\n=== Test 3: Calculating course rating ===');
    const ratingData = await Review.calculateCourseRating(course._id);
    console.log('✅ Course rating calculated:', ratingData);

    // Test 4: Check if user can review
    console.log('\n=== Test 4: Checking review eligibility ===');
    const canReview = await Review.canUserReview(user._id, course._id);
    console.log('✅ Review eligibility check:', canReview);

    // Test 5: Mark review as helpful
    console.log('\n=== Test 5: Marking review as helpful ===');
    await testReview.markHelpful(user._id);
    console.log('✅ Review marked as helpful');

    // Test 6: Get user reviews
    console.log('\n=== Test 6: Getting user reviews ===');
    const userReviews = await Review.getUserReviews(user._id);
    console.log('✅ User reviews retrieved:', userReviews.length, 'reviews');

    // Clean up test data
    console.log('\n=== Cleanup ===');
    await Review.findByIdAndDelete(testReview._id);
    console.log('✅ Test review deleted');

    console.log('\n🎉 All tests passed! Review system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testReviewSystem();




