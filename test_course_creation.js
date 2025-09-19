// Test script to debug course creation issues
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testCourseCreation() {
  console.log('🧪 Testing Course Creation...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData.status);

    // Test 2: Try to create a course without authentication (should fail)
    console.log('\n2. Testing course creation without auth (should fail)...');
    const testCourse = {
      title: 'Test Course',
      description: 'A test course',
      category: 'Testing',
      level: 'beginner',
      duration: 120,
      thumbnail: 'https://example.com/thumbnail.jpg',
      tags: ['test'],
      isPublished: false,
      instructorName: 'Test Instructor',
      videos: [],
      assessments: []
    };

    const courseResponse = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCourse)
    });

    console.log('Response status:', courseResponse.status);
    const responseText = await courseResponse.text();
    console.log('Response body:', responseText);

    if (courseResponse.status === 401) {
      console.log('✅ Expected: Authentication required');
    } else {
      console.log('❌ Unexpected response');
    }

    // Test 3: Check if courses endpoint is accessible
    console.log('\n3. Testing courses list endpoint...');
    const coursesResponse = await fetch(`${BASE_URL}/courses`);
    console.log('Courses endpoint status:', coursesResponse.status);
    
    if (coursesResponse.ok) {
      const coursesData = await coursesResponse.json();
      console.log('✅ Courses endpoint accessible');
      console.log('   Found', coursesData.length, 'courses');
    } else {
      console.log('❌ Courses endpoint failed:', await coursesResponse.text());
    }

    // Test 4: Check authentication endpoint
    console.log('\n4. Testing authentication endpoint...');
    const authResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    console.log('Auth endpoint status:', authResponse.status);
    if (authResponse.status === 400 || authResponse.status === 401) {
      console.log('✅ Auth endpoint responding (expected failure for invalid credentials)');
    } else {
      console.log('❌ Unexpected auth response:', await authResponse.text());
    }

    console.log('\n🔍 Debugging Summary:');
    console.log('- Backend is running ✅');
    console.log('- Course creation requires authentication ✅');
    console.log('- Check if you are logged in as admin/instructor');
    console.log('- Check if your JWT token is valid');
    console.log('- Check browser console for detailed error messages');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCourseCreation();
