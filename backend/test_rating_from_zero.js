const mongoose = require('mongoose');
const Course = require('./models/Course');
const Review = require('./models/Review');
const User = require('./models/User');

require('dotenv').config();

const testRatingFromZero = async () => {
  try {
    console.log('🧪 Testing Rating System from Zero\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // 1. Get a course that should have 0 ratings
    const course = await Course.findOne({}).limit(1);
    if (!course) {
      console.log('❌ No courses found');
      return;
    }
    
    console.log(`📚 Testing with: "${course.title}"`);
    console.log(`📊 Initial rating: ${course.rating.average}/5 (${course.rating.count} reviews)`);
    
    if (course.rating.average !== 0 || course.rating.count !== 0) {
      console.log('❌ Course doesn\'t start with 0 rating');
      return;
    }
    
    // 2. Create test customers
    const customers = [];
    for (let i = 1; i <= 3; i++) {
      let customer = await User.findOne({ email: `customer${i}@test.com` });
      if (!customer) {
        customer = new User({
          firstName: `Customer`,
          lastName: `${i}`,
          email: `customer${i}@test.com`,
          password: 'testpassword',
          username: `customer${i}`
        });
        await customer.save();
        console.log(`👤 Created Customer ${i}`);
      }
      
      // Enroll customer in course
      if (!course.enrolledStudents.find(s => s.student.toString() === customer._id.toString())) {
        course.enrolledStudents.push({
          student: customer._id,
          enrolledAt: new Date(),
          progress: 80 // Enough to allow reviews
        });
      }
      
      customers.push(customer);
    }
    
    await course.save();
    console.log('📝 Enrolled all customers in course');
    
    // 3. Test adding reviews one by one and watch ratings update
    const reviewData = [
      { rating: 5, title: 'Excellent!', comment: 'Amazing course, learned so much!' },
      { rating: 4, title: 'Very good', comment: 'Great content, well explained.' },
      { rating: 3, title: 'Good', comment: 'Decent course, could be better.' }
    ];
    
    for (let i = 0; i < reviewData.length; i++) {
      const customer = customers[i];
      const reviewInfo = reviewData[i];
      
      console.log(`\n⭐ Customer ${i + 1} adding review (${reviewInfo.rating}/5)...`);
      
      // Remove existing review if any
      await Review.findOneAndDelete({ user: customer._id, course: course._id });
      
      // Add new review
      const review = new Review({
        course: course._id,
        user: customer._id,
        rating: reviewInfo.rating,
        title: reviewInfo.title,
        comment: reviewInfo.comment
      });
      
      await review.save();
      console.log(`✅ Review saved`);
      
      // Check updated course rating
      const updatedCourse = await Course.findById(course._id);
      const expectedAverage = reviewData.slice(0, i + 1).reduce((sum, r) => sum + r.rating, 0) / (i + 1);
      
      console.log(`📊 Updated rating: ${updatedCourse.rating.average}/5 (${updatedCourse.rating.count} reviews)`);
      console.log(`🔍 Expected: ${expectedAverage.toFixed(1)}/5 (${i + 1} reviews)`);
      
      // Verify accuracy
      if (Math.abs(updatedCourse.rating.average - expectedAverage) < 0.01 && updatedCourse.rating.count === i + 1) {
        console.log(`✅ Rating calculation correct!`);
      } else {
        console.log(`❌ Rating calculation incorrect!`);
      }
    }
    
    // 4. Final verification
    const finalCourse = await Course.findById(course._id);
    const allRatings = reviewData.map(r => r.rating);
    const expectedFinalAverage = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
    
    console.log(`\n📊 Final Results:`);
    console.log(`   Current: ${finalCourse.rating.average}/5 (${finalCourse.rating.count} reviews)`);
    console.log(`   Expected: ${expectedFinalAverage.toFixed(1)}/5 (${allRatings.length} reviews)`);
    
    const isCorrect = Math.abs(finalCourse.rating.average - expectedFinalAverage) < 0.01 && 
                     finalCourse.rating.count === allRatings.length;
    
    if (isCorrect) {
      console.log(`\n🎉 SUCCESS: Rating system works perfectly!`);
      console.log(`✅ Started from 0 ratings`);
      console.log(`✅ Updated correctly after each customer review`);
      console.log(`✅ Final calculation is accurate`);
    } else {
      console.log(`\n❌ FAILED: Rating system has issues`);
    }
    
    // 5. Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const apiRating = await Review.calculateCourseRating(course._id);
    console.log(`API Response:`, apiRating);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testRatingFromZero();