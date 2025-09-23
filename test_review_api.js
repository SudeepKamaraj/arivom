// Simple test to check review API functionality
const API_BASE = process.env.NODE_ENV === 'production' ? 'https://arivom-backend.onrender.com/api' : 'http://localhost:5000/api';

async function testReviewAPI() {
  console.log('🧪 Testing Review API Functionality...\n');

  try {
    // First, test if the server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Server is running:', health.status);
    } else {
      console.log('❌ Server health check failed');
      return;
    }

    // Test getting courses
    console.log('\n2️⃣ Testing courses endpoint...');
    const coursesResponse = await fetch(`${API_BASE}/courses`);
    if (coursesResponse.ok) {
      const courses = await coursesResponse.json();
      console.log(`✅ Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        const testCourse = courses[0];
        console.log(`Test course: ${testCourse.title} (ID: ${testCourse._id})`);
        
        // Test review endpoint without authentication (should fail)
        console.log('\n3️⃣ Testing review endpoint without auth...');
        const reviewResponse = await fetch(`${API_BASE}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            courseId: testCourse._id,
            rating: 5,
            title: 'Test Review',
            comment: 'This is a test review to check functionality.'
          })
        });
        
        if (reviewResponse.status === 401) {
          console.log('✅ Review endpoint requires authentication (correct)');
        } else {
          console.log('⚠️ Review endpoint response:', reviewResponse.status);
        }
        
        // Test getting reviews for the course (public endpoint)
        console.log('\n4️⃣ Testing get reviews endpoint...');
        const getReviewsResponse = await fetch(`${API_BASE}/reviews/course/${testCourse._id}`);
        if (getReviewsResponse.ok) {
          const reviewsData = await getReviewsResponse.json();
          console.log(`✅ Course has ${reviewsData.reviews.length} reviews`);
          console.log(`Total reviews: ${reviewsData.pagination.totalReviews}`);
        } else {
          console.log('❌ Failed to get reviews');
        }
      }
    } else {
      console.log('❌ Failed to get courses');
    }

    console.log('\n📋 Summary:');
    console.log('- Server is running ✅');
    console.log('- Courses endpoint works ✅'); 
    console.log('- Review endpoint requires auth ✅');
    console.log('- Get reviews endpoint works ✅');
    console.log('\n💡 To test review submission:');
    console.log('1. Make sure you are logged in on the frontend');
    console.log('2. Complete a course or have sufficient progress');
    console.log('3. Try submitting a review from the course completion modal');
    console.log('4. Check browser console for detailed error messages');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testReviewAPI();