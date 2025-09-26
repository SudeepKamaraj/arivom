const mongoose = require('mongoose');
const Course = require('./models/Course');
const Review = require('./models/Review');

require('dotenv').config();

const fixInconsistentRatings = async () => {
  try {
    console.log('🔍 Finding and Fixing Inconsistent Course Ratings\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all courses
    const courses = await Course.find({});
    console.log(`📚 Checking ${courses.length} courses for inconsistencies\n`);
    
    let inconsistentCourses = [];
    let fixedCourses = 0;
    
    for (const course of courses) {
      // Get actual reviews for this course
      const actualReviews = await Review.find({ course: course._id });
      const actualReviewCount = actualReviews.length;
      
      // Calculate actual rating from reviews
      let actualRating = { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      
      if (actualReviewCount > 0) {
        const totalRating = actualReviews.reduce((sum, review) => sum + review.rating, 0);
        actualRating.average = Math.round((totalRating / actualReviewCount) * 10) / 10;
        actualRating.count = actualReviewCount;
        
        // Calculate distribution
        actualReviews.forEach(review => {
          actualRating.distribution[review.rating] = (actualRating.distribution[review.rating] || 0) + 1;
        });
      }
      
      // Compare with stored rating
      const storedRating = course.rating || { average: 0, count: 0 };
      const isInconsistent = storedRating.average !== actualRating.average || storedRating.count !== actualRating.count;
      
      if (isInconsistent) {
        inconsistentCourses.push({
          course,
          stored: storedRating,
          actual: actualRating,
          actualReviews: actualReviews.length
        });
        
        console.log(`❌ INCONSISTENT: "${course.title}"`);
        console.log(`   Stored:  ${storedRating.average}/5 (${storedRating.count} reviews)`);
        console.log(`   Actual:  ${actualRating.average}/5 (${actualRating.count} reviews)`);
        console.log(`   Reviews in DB: ${actualReviews.length}`);
        
        // Fix the inconsistency
        await Course.findByIdAndUpdate(course._id, {
          'rating.average': actualRating.average,
          'rating.count': actualRating.count
        });
        
        fixedCourses++;
        console.log(`   ✅ FIXED: Now shows ${actualRating.average}/5 (${actualRating.count} reviews)\n`);
      } else {
        console.log(`✅ CONSISTENT: "${course.title}" - ${storedRating.average}/5 (${storedRating.count} reviews)`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Total courses checked: ${courses.length}`);
    console.log(`   Inconsistent courses: ${inconsistentCourses.length}`);
    console.log(`   Courses fixed: ${fixedCourses}`);
    
    if (inconsistentCourses.length === 0) {
      console.log('\n🎉 All courses have consistent ratings!');
    } else {
      console.log(`\n🔧 Fixed ${fixedCourses} courses with inconsistent ratings`);
    }
    
    // Final verification
    console.log('\n🔍 Final Verification - All Course Ratings:');
    const verifiedCourses = await Course.find({}).select('title rating');
    
    for (const course of verifiedCourses) {
      const reviewCount = await Review.countDocuments({ course: course._id });
      const rating = course.rating;
      const status = reviewCount === 0 ? 'No ratings yet' : `${rating.average}/5 (${rating.count} reviews)`;
      const emoji = reviewCount === 0 ? '➖' : '⭐';
      
      console.log(`${emoji} ${course.title}: ${status}`);
      
      // Double check consistency
      if (reviewCount !== rating.count) {
        console.log(`   ⚠️ WARNING: Still inconsistent! DB has ${reviewCount} reviews but rating shows ${rating.count}`);
      }
    }
    
    console.log('\n✅ Rating consistency check completed!');
    
  } catch (error) {
    console.error('❌ Error fixing ratings:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

fixInconsistentRatings();