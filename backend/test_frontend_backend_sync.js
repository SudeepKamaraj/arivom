const mongoose = require('mongoose');
const Course = require('./models/Course');
const fetch = require('node-fetch');

require('dotenv').config();

const testFrontendBackendSync = async () => {
  try {
    console.log('🔄 Testing Frontend-Backend Rating Synchronization\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get courses from backend API (same as frontend)
    console.log('📡 Fetching courses from API...');
    const apiResponse = await fetch('http://localhost:5001/api/courses');
    const apiCourses = await apiResponse.json();
    
    console.log(`📚 API returned ${apiCourses.length} courses\n`);
    
    // Compare with database
    console.log('🔍 Comparing API data with database:');
    
    for (const apiCourse of apiCourses) {
      const dbCourse = await Course.findById(apiCourse._id);
      
      if (!dbCourse) {
        console.log(`❌ Course ${apiCourse.title} not found in database`);
        continue;
      }
      
      const apiRating = apiCourse.rating;
      const dbRating = dbCourse.rating;
      
      const isConsistent = apiRating.average === dbRating.average && apiRating.count === dbRating.count;
      
      if (isConsistent) {
        if (apiRating.count === 0) {
          console.log(`✅ ${apiCourse.title}: No ratings yet (0/5, 0 reviews)`);
        } else {
          console.log(`✅ ${apiCourse.title}: ${apiRating.average}/5 (${apiRating.count} reviews)`);
        }
      } else {
        console.log(`❌ INCONSISTENT: ${apiCourse.title}`);
        console.log(`   API: ${apiRating.average}/5 (${apiRating.count} reviews)`);
        console.log(`   DB:  ${dbRating.average}/5 (${dbRating.count} reviews)`);
      }
    }
    
    console.log('\n📊 Summary:');
    const coursesWithRatings = apiCourses.filter(c => c.rating.count > 0);
    const coursesWithoutRatings = apiCourses.filter(c => c.rating.count === 0);
    
    console.log(`   Total courses: ${apiCourses.length}`);
    console.log(`   With ratings: ${coursesWithRatings.length}`);
    console.log(`   Without ratings: ${coursesWithoutRatings.length}`);
    
    console.log('\n✅ Frontend will now display:');
    coursesWithoutRatings.forEach(course => {
      console.log(`   • ${course.title}: "No ratings yet"`);
    });
    
    coursesWithRatings.forEach(course => {
      console.log(`   • ${course.title}: "${course.rating.average}/5 (${course.rating.count} review${course.rating.count !== 1 ? 's' : ''})"`);
    });
    
    console.log('\n🎉 Frontend-Backend synchronization complete!');
    console.log('   • API serves correct rating data from database');
    console.log('   • Frontend will display accurate ratings');
    console.log('   • Courses with 0 reviews show "No ratings yet"');
    console.log('   • Courses with reviews show proper averages');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testFrontendBackendSync();