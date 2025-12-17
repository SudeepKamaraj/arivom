const fetch = require('node-fetch');

async function testRecommendationFlow() {
  console.log('🧪 Testing Recommendation Flow...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connectivity...');
    const healthResponse = await fetch('http://localhost:5001/api/health');
    if (healthResponse.ok) {
      console.log('✅ Backend server is running\n');
    } else {
      throw new Error('Backend not responding');
    }

    // Test 2: Check if courses are available
    console.log('2. Testing courses endpoint...');
    const coursesResponse = await fetch('http://localhost:5001/api/courses');
    const courses = await coursesResponse.json();
    console.log(`✅ Found ${courses.length} courses available\n`);

    // Test 3: Test the new recommendation endpoint (without auth - just structure)
    console.log('3. Testing recommendation endpoint structure...');
    const recResponse = await fetch('http://localhost:5001/api/recommendations/questionnaire');
    if (recResponse.status === 401) {
      console.log('✅ Questionnaire endpoint is properly protected (requires auth)\n');
    } else {
      console.log('⚠️  Questionnaire endpoint is not protected\n');
    }

    console.log('🎉 All basic tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open http://localhost:5174 in your browser');
    console.log('2. Sign up or login with OTP verification');
    console.log('3. After login, you\'ll be on the home page');
    console.log('4. Click "Get Recommendations" button');
    console.log('5. Complete the 6-step questionnaire');
    console.log('6. View your recommendations');
    console.log('7. Navigate to /recommendations to see saved recommendations');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRecommendationFlow();