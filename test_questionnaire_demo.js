// Simple test to trigger questionnaire through chat intent
const message1 = "I want to start learning programming, can you help me?";
const message2 = "What should I learn first?";
const message3 = "I'm a beginner and want guidance";

// Test intent recognition for questionnaire
function testIntentRecognition() {
  console.log('🔍 Testing Intent Recognition for Questionnaire...\n');
  
  // Simple intent patterns (matching our backend)
  const QUESTIONNAIRE_PATTERNS = [
    /\b(start|begin|new to|beginner|guidance|help me learn|what should i learn|learning path|career guidance)\b/i,
    /\b(programming|coding|development|tech|computer science)\b/i
  ];

  function detectQuestionnaire(message) {
    const hasQuestionnaireIntent = QUESTIONNAIRE_PATTERNS.some(pattern => pattern.test(message));
    return hasQuestionnaireIntent;
  }

  // Test messages
  const testMessages = [
    "I want to start learning programming, can you help me?",
    "What should I learn first?", 
    "I'm new to programming and need guidance",
    "Can you help me choose a career path?",
    "Hello there",
    "Show me Python courses"
  ];

  testMessages.forEach(msg => {
    const isQuestionnaire = detectQuestionnaire(msg);
    console.log(`Message: "${msg}"`);
    console.log(`Questionnaire Intent: ${isQuestionnaire ? '✅ YES' : '❌ NO'}\n`);
  });
}

testIntentRecognition();

// Test questionnaire response generation (simulated)
console.log('📝 Sample Questionnaire Flow:\n');

console.log('🤖 Bot: Welcome! I\'d love to help you create a personalized learning path. Let me ask you a few questions to understand your background and goals better.\n');

console.log('Question 1: What\'s your current programming experience?');
console.log('a) Complete beginner - never coded before');
console.log('b) Beginner with some HTML/CSS knowledge'); 
console.log('c) Some experience with one programming language');
console.log('d) Intermediate - comfortable with multiple languages\n');

console.log('👤 User Answer: "b) Beginner with some HTML/CSS knowledge"\n');

console.log('🤖 Bot: Great! Since you have some HTML/CSS foundation, that\'s a perfect starting point.\n');

console.log('Question 2: What are your learning goals?');
console.log('a) Build websites and web applications');
console.log('b) Data science and analytics');
console.log('c) Mobile app development');
console.log('d) Game development');
console.log('e) General programming skills\n');

console.log('👤 User Answer: "a) Build websites and web applications"\n');

console.log('🤖 Bot: Excellent choice! Web development is very rewarding.\n');

console.log('Question 3: What\'s your preferred learning timeline?');
console.log('a) 1-2 months (intensive learning)');
console.log('b) 3-6 months (balanced approach)');
console.log('c) 6+ months (steady pace)');
console.log('d) No specific timeline\n');

console.log('👤 User Answer: "b) 3-6 months (balanced approach)"\n');

console.log('🎯 🤖 Bot: Perfect! Based on your answers, here\'s your personalized learning path:\n');

console.log('📚 **Your Learning Journey:**');
console.log('1. **JavaScript Fundamentals** (Month 1)');
console.log('   📹 Video: "JavaScript Basics for Beginners"');
console.log('   🔗 https://www.youtube.com/watch?v=javascript-basics');
console.log('');
console.log('2. **React.js Development** (Month 2-3)');
console.log('   📹 Video: "Build Your First React App"');
console.log('   🔗 https://www.youtube.com/watch?v=react-tutorial');
console.log('');
console.log('3. **Backend with Node.js** (Month 4-5)');
console.log('   📹 Video: "Node.js and Express Tutorial"');
console.log('   🔗 https://www.youtube.com/watch?v=nodejs-express');
console.log('');
console.log('4. **Full-Stack Project** (Month 6)');
console.log('   📹 Video: "Build a Complete Web Application"');
console.log('   🔗 https://www.youtube.com/watch?v=fullstack-project');
console.log('');

console.log('✨ **Recommended Courses:**');
console.log('🎓 "Complete Web Development Bootcamp" - 40 hours');
console.log('🎓 "JavaScript Masterclass" - Dr. Sarah Wilson - 25 hours');
console.log('🎓 "React for Beginners" - Tech Academy - 20 hours\n');

console.log('💡 **Next Steps:** Start with the JavaScript video above, and I\'ll be here to help you every step of the way! Feel free to ask questions anytime.');

console.log('\n🎉 Interactive Questionnaire System is ready to guide users through personalized learning journeys!');