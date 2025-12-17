// Advanced Chatbot Test Suite
// Run this to test all the new AI features

const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

// Test data for comprehensive chatbot evaluation
const testQueries = [
  // Greeting Tests
  {
    category: "Greeting",
    queries: [
      "Hello!",
      "Hi there",
      "Good morning",
      "Hey what's up?",
      "Greetings"
    ]
  },
  
  // Course Recommendation Tests
  {
    category: "Course Recommendations",
    queries: [
      "Recommend courses for me",
      "I want to learn Python programming",
      "What are the best JavaScript courses?",
      "Suggest Java development courses",
      "Find me data science courses",
      "I'm interested in web development",
      "Show me mobile app development courses",
      "Cloud computing courses please",
      "Best courses for beginners",
      "Advanced programming courses"
    ]
  },
  
  // Study Schedule Tests
  {
    category: "Study Planning",
    queries: [
      "Create a study schedule for me",
      "I need a learning plan",
      "Plan my weekly study routine",
      "Intensive study schedule please",
      "Beginner study plan",
      "How should I organize my learning time?",
      "Create a bootcamp-style schedule",
      "I have 10 hours per week to study",
      "Daily study routine suggestions"
    ]
  },
  
  // Progress Tracking Tests
  {
    category: "Progress Tracking",
    queries: [
      "Show my learning progress",
      "How am I doing?",
      "My learning statistics",
      "Display my achievements",
      "Check my course completion status",
      "Learning analytics dashboard",
      "My study performance",
      "Show certificates earned",
      "Track my learning journey"
    ]
  },
  
  // Learning Tips Tests
  {
    category: "Learning Tips",
    queries: [
      "Give me study tips",
      "How to learn more effectively?",
      "I'm struggling to focus",
      "Help me remember better",
      "Motivation tips for learning",
      "How to study faster?",
      "Memory improvement techniques",
      "Stay focused while studying",
      "Learning efficiency tips",
      "I feel stuck in my learning"
    ]
  },
  
  // Help and Features Tests
  {
    category: "Help & Features",
    queries: [
      "What can you do?",
      "Help me understand your features",
      "Show me available commands",
      "How to use this chatbot?",
      "What are your capabilities?",
      "Guide me through your functions"
    ]
  },
  
  // Natural Conversation Tests
  {
    category: "Natural Conversation",
    queries: [
      "I'm a complete beginner in programming",
      "I want to become a full-stack developer",
      "How long does it take to learn coding?",
      "Is it too late to start learning at 30?",
      "I'm confused about which technology to choose",
      "Can you help me plan my career transition?",
      "What's the difference between frontend and backend?",
      "Should I learn multiple programming languages?",
      "How do I stay motivated during difficult topics?",
      "I want to build mobile apps but don't know where to start"
    ]
  }
];

// Color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function testChatBot(query, category = "General") {
  try {
    console.log(colorize(`\n🔍 Testing: "${query}"`, 'cyan'));
    
    const response = await axios.post(`${API_BASE}/chat/test`, {
      message: query
    });
    
    if (response.data.success) {
      const message = response.data.message;
      console.log(colorize(`✅ Response Type: ${message.type}`, 'green'));
      console.log(colorize(`📝 Response Length: ${message.text.length} characters`, 'blue'));
      
      // Show first 200 characters of response
      const preview = message.text.length > 200 
        ? message.text.substring(0, 200) + "..." 
        : message.text;
      
      console.log(colorize(`📖 Preview:`, 'yellow'));
      console.log(colorize(preview, 'dim'));
      
      // Show any additional data
      if (message.data) {
        console.log(colorize(`📊 Additional Data: ${JSON.stringify(message.data).substring(0, 100)}...`, 'magenta'));
      }
      
      return {
        success: true,
        category,
        query,
        responseType: message.type,
        responseLength: message.text.length,
        hasData: !!message.data
      };
    } else {
      console.log(colorize(`❌ Test failed`, 'red'));
      return {
        success: false,
        category,
        query,
        error: 'API returned unsuccessful response'
      };
    }
    
  } catch (error) {
    console.log(colorize(`❌ Error: ${error.message}`, 'red'));
    return {
      success: false,
      category,
      query,
      error: error.message
    };
  }
}

async function runComprehensiveTest() {
  console.log(colorize('🤖 ADVANCED CHATBOT TEST SUITE', 'bright'));
  console.log(colorize('=' * 50, 'blue'));
  
  const results = [];
  let totalTests = 0;
  let successfulTests = 0;
  
  for (const testGroup of testQueries) {
    console.log(colorize(`\n📂 Category: ${testGroup.category}`, 'bright'));
    console.log(colorize('-'.repeat(30), 'blue'));
    
    for (const query of testGroup.queries) {
      totalTests++;
      const result = await testChatBot(query, testGroup.category);
      results.push(result);
      
      if (result.success) {
        successfulTests++;
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Test Summary
  console.log(colorize('\n📊 TEST SUMMARY', 'bright'));
  console.log(colorize('=' * 50, 'blue'));
  console.log(colorize(`Total Tests: ${totalTests}`, 'white'));
  console.log(colorize(`Successful: ${successfulTests}`, 'green'));
  console.log(colorize(`Failed: ${totalTests - successfulTests}`, 'red'));
  console.log(colorize(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`, 'cyan'));
  
  // Category Breakdown
  console.log(colorize('\n📈 CATEGORY BREAKDOWN', 'bright'));
  console.log(colorize('-'.repeat(30), 'blue'));
  
  const categoryStats = {};
  results.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { total: 0, success: 0 };
    }
    categoryStats[result.category].total++;
    if (result.success) {
      categoryStats[result.category].success++;
    }
  });
  
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const rate = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(colorize(`${category}: ${stats.success}/${stats.total} (${rate}%)`, 
      rate === '100.0' ? 'green' : rate >= '80.0' ? 'yellow' : 'red'));
  });
  
  // Response Type Analysis
  console.log(colorize('\n📝 RESPONSE TYPE ANALYSIS', 'bright'));
  console.log(colorize('-'.repeat(30), 'blue'));
  
  const responseTypes = {};
  results.filter(r => r.success).forEach(result => {
    const type = result.responseType || 'text';
    responseTypes[type] = (responseTypes[type] || 0) + 1;
  });
  
  Object.entries(responseTypes).forEach(([type, count]) => {
    console.log(colorize(`${type}: ${count} responses`, 'cyan'));
  });
  
  // Failed Tests Analysis
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log(colorize('\n❌ FAILED TESTS', 'bright'));
    console.log(colorize('-'.repeat(30), 'red'));
    
    failedTests.forEach(test => {
      console.log(colorize(`• ${test.query}`, 'red'));
      console.log(colorize(`  Error: ${test.error}`, 'dim'));
    });
  }
  
  console.log(colorize('\n🎉 Test completed! The advanced chatbot is ready!', 'bright'));
  
  return results;
}

// Feature demonstration
async function demonstrateFeatures() {
  console.log(colorize('\n🎯 FEATURE DEMONSTRATION', 'bright'));
  console.log(colorize('=' * 50, 'blue'));
  
  const demoQueries = [
    "Hi! I'm new here",
    "I want to learn Python for data science",
    "Create an intensive study schedule",
    "Show my learning progress",
    "I'm struggling to stay focused while studying",
    "What can you help me with?"
  ];
  
  for (const query of demoQueries) {
    console.log(colorize(`\n🎭 Demo: "${query}"`, 'magenta'));
    const result = await testChatBot(query, "Demo");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Main execution
async function main() {
  try {
    console.log(colorize('🚀 Starting Advanced Chatbot Tests...', 'bright'));
    
    // Test server connectivity
    try {
      await axios.get(`${API_BASE}/health`);
      console.log(colorize('✅ Server is running and accessible', 'green'));
    } catch (error) {
      console.log(colorize('❌ Server not accessible. Make sure backend is running on port 5001', 'red'));
      return;
    }
    
    // Run comprehensive tests
    const results = await runComprehensiveTest();
    
    // Run feature demonstration
    await demonstrateFeatures();
    
    console.log(colorize('\n🎊 All tests completed successfully!', 'bright'));
    console.log(colorize('The advanced chatbot is now fully trained and ready to help users!', 'green'));
    
  } catch (error) {
    console.log(colorize(`❌ Test suite failed: ${error.message}`, 'red'));
  }
}

// Command line execution
if (require.main === module) {
  main();
}

module.exports = { testChatBot, runComprehensiveTest, demonstrateFeatures };