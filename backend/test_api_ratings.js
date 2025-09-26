const fetch = require('node-fetch');

const testAPIRatings = async () => {
  try {
    console.log('🌐 Testing API Rating Consistency\n');
    
    // Fetch courses from API
    const response = await fetch('http://localhost:5001/api/courses');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const courses = await response.json();
    console.log(`📚 Fetched ${courses.length} courses from API\n`);
    
    courses.forEach((course, index) => {
      const rating = course.rating || { average: 0, count: 0 };
      const hasRatings = rating.count > 0;
      const displayRating = hasRatings 
        ? `${rating.average}/5 (${rating.count} review${rating.count !== 1 ? 's' : ''})`
        : 'No ratings yet';
      
      const emoji = hasRatings ? '⭐' : '➖';
      
      console.log(`${emoji} ${index + 1}. ${course.title}`);
      console.log(`     API Rating: ${displayRating}`);
      console.log(`     Raw data: average=${rating.average}, count=${rating.count}`);
      console.log('');
    });
    
    // Check if any course has inconsistent data
    const inconsistentCourses = courses.filter(course => {
      const rating = course.rating || { average: 0, count: 0 };
      return (rating.average > 0 && rating.count === 0) || (rating.average === 0 && rating.count > 0);
    });
    
    if (inconsistentCourses.length > 0) {
      console.log('❌ Found inconsistent courses:');
      inconsistentCourses.forEach(course => {
        console.log(`   - ${course.title}: average=${course.rating.average}, count=${course.rating.count}`);
      });
    } else {
      console.log('✅ All courses have consistent rating data');
      console.log('✅ Courses with 0 reviews show "No ratings yet"');
      console.log('✅ Courses with reviews show proper ratings');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

testAPIRatings();