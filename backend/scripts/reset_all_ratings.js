const mongoose = require('mongoose');
const Course = require('../models/Course');
const Review = require('../models/Review');

require('dotenv').config();

const resetAllRatings = async () => {
  try {
    console.log('🔄 Resetting All Course Ratings to 0\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // 1. Get count of existing reviews
    const reviewCount = await Review.countDocuments({});
    console.log(`📊 Found ${reviewCount} existing reviews to remove`);
    
    // 2. Remove all existing reviews
    if (reviewCount > 0) {
      const deleteResult = await Review.deleteMany({});
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} reviews`);
    } else {
      console.log('ℹ️ No existing reviews to delete');
    }
    
    // 3. Get all courses
    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses to reset`);
    
    // 4. Reset all course ratings to 0
    let resetCount = 0;
    for (const course of courses) {
      const currentRating = course.rating;
      
      // Check if course needs rating reset
      if (!currentRating || currentRating.average !== 0 || currentRating.count !== 0) {
        await Course.findByIdAndUpdate(course._id, {
          'rating.average': 0,
          'rating.count': 0
        });
        
        resetCount++;
        console.log(`✅ Reset "${course.title}": ${currentRating?.average || 'undefined'} → 0 (Count: ${currentRating?.count || 'undefined'} → 0)`);
      } else {
        console.log(`✓ "${course.title}": Already at 0 rating`);
      }
    }
    
    console.log(`\n📊 Reset Summary:`);
    console.log(`   • Total courses: ${courses.length}`);
    console.log(`   • Courses reset: ${resetCount}`);
    console.log(`   • Reviews removed: ${reviewCount}`);
    
    // 5. Verify all courses now have 0 ratings
    console.log('\n🔍 Verification - All Course Ratings:');
    const verificationCourses = await Course.find({}).select('title rating');
    
    let allCorrect = true;
    verificationCourses.forEach((course, index) => {
      const rating = course.rating;
      const isCorrect = rating && rating.average === 0 && rating.count === 0;
      
      if (isCorrect) {
        console.log(`✅ ${index + 1}. ${course.title}: 0.0/5 (0 reviews)`);
      } else {
        console.log(`❌ ${index + 1}. ${course.title}: ${rating?.average || 'N/A'}/5 (${rating?.count || 'N/A'} reviews)`);
        allCorrect = false;
      }
    });
    
    if (allCorrect) {
      console.log('\n🎉 SUCCESS: All courses now have 0 ratings!');
      console.log('📝 Courses are ready to receive customer reviews');
      console.log('⭐ Ratings will update automatically when customers add reviews');
    } else {
      console.log('\n❌ ERROR: Some courses still have non-zero ratings');
    }
    
  } catch (error) {
    console.error('❌ Error resetting ratings:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the reset script
resetAllRatings();