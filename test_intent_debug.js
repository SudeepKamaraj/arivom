// Test questionnaire intent recognition and response
const message = "I want to start learning programming, can you help me?";

// Simulate the intent recognition logic from the backend
function testIntentRecognition(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  const questionnairePatterns = [
    'start questionnaire', 'learning questionnaire', 'assessment', 'evaluate me',
    'what should i learn', 'help me choose', 'personalized', 'get started',
    'i want to start', 'guide me', 'recommend me', 'find courses for me',
    'i want to start learning programming', 'can you help me', 'help me learn',
    'learning path', 'guide', 'beginner', 'new to programming', 'getting started',
    'where to start', 'how to start', 'start learning', 'beginning', 'first steps'
  ];

  console.log(`Testing message: "${message}"`);
  console.log(`Lowercase: "${lowerMessage}"`);
  console.log('\nChecking patterns:');
  
  for (const pattern of questionnairePatterns) {
    const matches = lowerMessage.includes(pattern);
    console.log(`  "${pattern}" -> ${matches ? '✅ MATCH' : '❌ No match'}`);
    if (matches) {
      return { intent: 'questionnaire', pattern: pattern, matches: true };
    }
  }
  
  return { intent: 'unknown', matches: false };
}

const result = testIntentRecognition(message);
console.log(`\nResult: ${JSON.stringify(result, null, 2)}`);

if (result.matches) {
  console.log('\n✅ SUCCESS: Message should trigger questionnaire!');
  console.log('The intent recognition is working correctly.');
} else {
  console.log('\n❌ PROBLEM: Message is not matching questionnaire patterns');
  console.log('Need to fix pattern matching or add more patterns.');
}

// Test a few more messages
console.log('\n' + '='.repeat(50));
console.log('Testing additional messages:');

const testMessages = [
  'What should I learn first?',
  'Help me choose a learning path',
  'I am a beginner, guide me',
  'Can you help me get started?'
];

testMessages.forEach(msg => {
  const result = testIntentRecognition(msg);
  console.log(`"${msg}" -> ${result.matches ? '✅ Questionnaire' : '❌ Unknown'}`);
});