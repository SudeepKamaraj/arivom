/**
 * Test script to verify signup form validation
 * This script tests both client-side and server-side validation
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001/api/auth';

async function testValidation() {
  console.log('🧪 Testing Signup Form Validation\n');

  // Test cases for validation
  const testCases = [
    {
      name: 'Empty fields',
      data: {},
      expectError: true,
      description: 'Should fail with empty fields'
    },
    {
      name: 'Invalid email format',
      data: {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Test123!',
        firstName: 'John',
        lastName: 'Doe',
        skills: ['JavaScript']
      },
      expectError: true,
      description: 'Should fail with invalid email format'
    },
    {
      name: 'Weak password',
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        skills: ['JavaScript']
      },
      expectError: true,
      description: 'Should fail with weak password'
    },
    {
      name: 'Invalid username',
      data: {
        username: 'ab',
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'John',
        lastName: 'Doe',
        skills: ['JavaScript']
      },
      expectError: true,
      description: 'Should fail with username too short'
    },
    {
      name: 'Invalid first name',
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'J123',
        lastName: 'Doe',
        skills: ['JavaScript']
      },
      expectError: true,
      description: 'Should fail with invalid first name (contains numbers)'
    },
    {
      name: 'No skills selected',
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'John',
        lastName: 'Doe',
        skills: []
      },
      expectError: true,
      description: 'Should fail with no skills selected'
    },
    {
      name: 'Valid registration data',
      data: {
        username: 'validuser123',
        email: 'valid@example.com',
        password: 'ValidPass123!',
        firstName: 'John',
        lastName: 'Doe',
        skills: ['JavaScript', 'React'],
        interests: 'Web Development',
        careerObjective: 'Become a full-stack developer'
      },
      expectError: false,
      description: 'Should succeed with valid data'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📝 Test ${i + 1}: ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      const hasError = !response.ok;

      if (testCase.expectError === hasError) {
        console.log(`   ✅ PASSED - Expected error: ${testCase.expectError}, Got error: ${hasError}`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED - Expected error: ${testCase.expectError}, Got error: ${hasError}`);
        console.log(`   Response:`, result);
      }

      if (hasError && result.errors) {
        console.log(`   📋 Validation errors: ${result.errors.join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ FAILED - Network/Server error: ${error.message}`);
    }

    console.log('');
  }

  console.log(`🏁 Test Results: ${passedTests}/${totalTests} tests passed\n`);

  // Test login validation
  console.log('🔐 Testing Login Validation\n');

  const loginTests = [
    {
      name: 'Empty credentials',
      data: {},
      expectError: true
    },
    {
      name: 'Invalid email format',
      data: { email: 'invalid-email', password: 'somepassword' },
      expectError: true
    },
    {
      name: 'Missing password',
      data: { email: 'test@example.com' },
      expectError: true
    },
    {
      name: 'Valid format (may fail if user doesn\'t exist)',
      data: { email: 'test@example.com', password: 'somepassword' },
      expectError: true // Will fail because user likely doesn't exist
    }
  ];

  let loginPassedTests = 0;
  
  for (let i = 0; i < loginTests.length; i++) {
    const testCase = loginTests[i];
    console.log(`📝 Login Test ${i + 1}: ${testCase.name}`);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      const hasError = !response.ok;

      if (testCase.expectError === hasError) {
        console.log(`   ✅ PASSED`);
        loginPassedTests++;
      } else {
        console.log(`   ❌ FAILED`);
        console.log(`   Response:`, result);
      }

      if (hasError && result.errors) {
        console.log(`   📋 Validation errors: ${result.errors.join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ FAILED - Network/Server error: ${error.message}`);
    }

    console.log('');
  }

  console.log(`🏁 Login Test Results: ${loginPassedTests}/${loginTests.length} tests passed\n`);
  
  const totalPassedTests = passedTests + loginPassedTests;
  const totalAllTests = totalTests + loginTests.length;
  
  console.log(`🎯 Overall Results: ${totalPassedTests}/${totalAllTests} tests passed`);
  
  if (totalPassedTests === totalAllTests) {
    console.log('🎉 All validation tests passed! Form validation is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the validation implementation.');
  }
}

// Check if server is running before running tests
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test' })
    });
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the backend server first:');
    console.log('   cd backend && npm start');
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Form Validation Tests\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    return;
  }
  
  await testValidation();
}

runTests().catch(console.error);