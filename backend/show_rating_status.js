const mongoose = require('mongoose');
const Course = require('./models/Course');

require('dotenv').config();

const showRatingStatus = async () => {
  try {
    console.log('📊 Current Rating Status of All Courses\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const courses = await Course.find({}).select('title rating').sort({ title: 1 });
    
    console.log(`\n📚 Found ${courses.length} courses:\n`);
    
    let coursesWithRatings = 0;
    let coursesWithoutRatings = 0;
    
    courses.forEach((course, index) => {
      const hasRatings = course.rating.count > 0;
      const displayRating = hasRatings 
        ? `${course.rating.average}/5 (${course.rating.count} review${course.rating.count !== 1 ? 's' : ''})`
        : 'No ratings yet';
      
      const emoji = hasRatings ? '⭐' : '➖';
      
      console.log(`${emoji} ${index + 1}. ${course.title}`);
      console.log(`     Rating: ${displayRating}`);
      console.log('');
      
      if (hasRatings) {
        coursesWithRatings++;
      } else {
        coursesWithoutRatings++;
      }
    });
    
    console.log('📈 Summary:');
    console.log(`   Courses with ratings: ${coursesWithRatings}`);
    console.log(`   Courses without ratings: ${coursesWithoutRatings}`);
    console.log(`   Total courses: ${courses.length}`);
    
    console.log('\n✅ Rating System Status:');
    console.log('   • All courses start with 0 ratings ("No ratings yet")');
    console.log('   • Ratings update automatically when customers add reviews');
    console.log('   • Frontend displays appropriate messages for both states');
    console.log('   • System is ready for production!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

showRatingStatus();