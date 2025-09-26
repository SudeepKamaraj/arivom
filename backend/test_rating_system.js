const mongoose = require('mongoose');
const Course = require('./models/Course');
const Review = require('./models/Review');
const User = require('./models/User');

require('dotenv').config();

const testRatingSystem = async () => {
  try {
    console.log('🧪 Testing Rating System End-to-End\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // 1. Get the first course
    const course = await Course.findOne({}).limit(1);
    if (!course) {
      console.log('❌ No courses found in database');
      return;
    }
    
    console.log(`📚 Testing with course: "${course.title}"`);
    console.log(`📊 Initial rating: Average ${course.rating.average}, Count ${course.rating.count}\n`);
    
    // 2. Create a test user if doesn't exist
    let testUser = await User.findOne({ email: 'test@rating.com' });
    if (!testUser) {
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@rating.com',
        password: 'testpassword',
        username: 'testuser'
      });
      await testUser.save();
      console.log('👤 Created test user');
    }
    
    // 3. Enroll user in course (required for reviews)
    if (!course.enrolledStudents.find(s => s.student.toString() === testUser._id.toString())) {
      course.enrolledStudents.push({
        student: testUser._id,
        enrolledAt: new Date(),
        progress: 75 // Enough to allow review
      });
      await course.save();
      console.log('📝 Enrolled user in course');
    }
    
    // 4. Check if review already exists
    const existingReview = await Review.findOne({ user: testUser._id, course: course._id });
    if (existingReview) {
      console.log('🗑️ Removing existing review for clean test');
      await Review.findByIdAndDelete(existingReview._id);
    }
    
    // 5. Add a test review
    console.log('⭐ Adding test review (Rating: 4.5)...');
    const review = new Review({
      course: course._id,
      user: testUser._id,
      rating: 4.5,
      title: 'Great course!',
      comment: 'This course helped me learn a lot. The content is well-structured and the instructor explains concepts clearly.'
    });
    
    await review.save();
    console.log('✅ Review saved successfully');
    
    // 6. Check if course rating was updated
    const updatedCourse = await Course.findById(course._id);
    console.log(`📊 Updated rating: Average ${updatedCourse.rating.average}, Count ${updatedCourse.rating.count}`);
    
    // 7. Add another review with different user
    let testUser2 = await User.findOne({ email: 'test2@rating.com' });
    if (!testUser2) {
      testUser2 = new User({
        firstName: 'Test2',
        lastName: 'User2',
        email: 'test2@rating.com',
        password: 'testpassword',
        username: 'testuser2'
      });
      await testUser2.save();
      console.log('👤 Created second test user');
    }
    
    // Enroll second user
    if (!updatedCourse.enrolledStudents.find(s => s.student.toString() === testUser2._id.toString())) {
      updatedCourse.enrolledStudents.push({
        student: testUser2._id,
        enrolledAt: new Date(),
        progress: 80
      });
      await updatedCourse.save();
      console.log('📝 Enrolled second user in course');
    }
    
    // Remove existing review from second user if any
    const existingReview2 = await Review.findOne({ user: testUser2._id, course: course._id });
    if (existingReview2) {
      await Review.findByIdAndDelete(existingReview2._id);
    }
    
    console.log('⭐ Adding second test review (Rating: 3.5)...');
    const review2 = new Review({
      course: course._id,
      user: testUser2._id,
      rating: 3.5,
      title: 'Good course',
      comment: 'The course content is good, but could use more practical examples.'
    });
    
    await review2.save();
    console.log('✅ Second review saved successfully');
    
    // 8. Check final rating
    const finalCourse = await Course.findById(course._id);
    console.log(`📊 Final rating: Average ${finalCourse.rating.average}, Count ${finalCourse.rating.count}`);
    
    // 9. Calculate expected average
    const expectedAverage = (4.5 + 3.5) / 2;
    console.log(`🔍 Expected average: ${expectedAverage}`);
    
    // 10. Verify calculation
    if (Math.abs(finalCourse.rating.average - expectedAverage) < 0.01 && finalCourse.rating.count === 2) {
      console.log('✅ Rating system working correctly!');
      console.log(`✅ Average: ${finalCourse.rating.average} (Expected: ${expectedAverage})`);
      console.log(`✅ Count: ${finalCourse.rating.count} (Expected: 2)`);
    } else {
      console.log('❌ Rating system not working correctly');
      console.log(`❌ Got: Average ${finalCourse.rating.average}, Count ${finalCourse.rating.count}`);
      console.log(`❌ Expected: Average ${expectedAverage}, Count 2`);
    }
    
    // 11. Test rating API endpoint
    console.log('\n🌐 Testing rating API endpoint...');
    const ratingData = await Review.calculateCourseRating(course._id);
    console.log('API Response:', ratingData);
    
    if (ratingData.average === finalCourse.rating.average && ratingData.count === finalCourse.rating.count) {
      console.log('✅ Rating API working correctly!');
    } else {
      console.log('❌ Rating API mismatch');
    }
    
    console.log('\n🎉 Rating system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

testRatingSystem();