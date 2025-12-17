const mongoose = require('mongoose');
const Course = require('./models/Course');
const Review = require('./models/Review');
const fetch = require('node-fetch');

require('dotenv').config();

const testApiRatings = async () => {
  try {
    console.log('🔍 Testing API Course Ratings\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all courses from database
    const courses = await Course.find({}).select('title rating');
    console.log(`📚 Found ${courses.length} courses in database\n`);
    
    // Test API endpoint
    console.log('🌐 Testing API endpoint: GET /api/courses');
    
    try {
      const response = await fetch('http://localhost:5001/api/courses');
      const apiCourses = await response.json();
      
      console.log(`📡 API returned ${apiCourses.length} courses\n`);
      
      console.log('📊 Rating Comparison (Database vs API):');
      console.log('=' .repeat(80));
      
      let allCorrect = true;
      
      for (const dbCourse of courses) {
        const apiCourse = apiCourses.find(c => c._id === dbCourse._id.toString());
        
        if (!apiCourse) {
          console.log(`❌ ${dbCourse.title}: Not found in API response`);
          allCorrect = false;
          continue;
        }
        
        const dbRating = dbCourse.rating;
        const apiRating = apiCourse.rating;
        
        const ratingMatch = dbRating.average === apiRating.average && dbRating.count === apiRating.count;
        const emoji = ratingMatch ? '✅' : '❌';
        
        console.log(`${emoji} ${dbCourse.title}:`);
        console.log(`   Database: ${dbRating.average}/5 (${dbRating.count} reviews)`);
        console.log(`   API:      ${apiRating.average}/5 (${apiRating.count} reviews)`);
        
        if (!ratingMatch) {
          allCorrect = false;
        }
        
        // Check actual reviews
        const actualReviews = await Review.countDocuments({ course: dbCourse._id });
        if (actualReviews !== dbRating.count) {
          console.log(`   ⚠️ WARNING: Database has ${actualReviews} actual reviews but rating shows ${dbRating.count}`);
          allCorrect = false;
        }
        
        console.log('');
      }
      
      if (allCorrect) {
        console.log('🎉 SUCCESS: All ratings are consistent between database and API!');
      } else {
        console.log('❌ ISSUES: Some ratings are inconsistent');
      }
      
      // Show courses with 0 ratings vs courses with ratings
      console.log('\n📈 Rating Summary:');
      const coursesWithRatings = apiCourses.filter(c => c.rating.count > 0);
      const coursesWithoutRatings = apiCourses.filter(c => c.rating.count === 0);
      
      console.log(`   Courses with ratings: ${coursesWithRatings.length}`);
      coursesWithRatings.forEach(c => {
        console.log(`   ⭐ ${c.title}: ${c.rating.average}/5 (${c.rating.count} reviews)`);
      });
      
      console.log(`\n   Courses without ratings: ${coursesWithoutRatings.length}`);
      coursesWithoutRatings.forEach(c => {
        console.log(`   ➖ ${c.title}: No ratings yet`);
      });
      
    } catch (fetchError) {
      console.error('❌ Failed to fetch from API:', fetchError.message);
      console.log('💡 Make sure the backend server is running on port 5001');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testApiRatings();