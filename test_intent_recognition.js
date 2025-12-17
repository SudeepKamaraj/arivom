// Test intent recognition function

const CHAT_INTENTS = {
  course_recommendation: {
    patterns: [
      'recommend', 'suggest', 'course', 'learn', 'find course', 'what should i study',
      'new course', 'best course', 'popular course', 'trending course', 'good course',
      'course for me', 'what to learn', 'learning path', 'curriculum', 'study material',
      'trending', 'popular', 'hot', 'latest', 'new', 'best', 'top', 'programming',
      'topics', 'technologies', 'skills', 'programming topics', 'tech trends'
    ],
    technologies: {
      python: ['python', 'py', 'django', 'flask', 'data science', 'machine learning', 'ai'],
      javascript: ['javascript', 'js', 'node', 'react', 'vue', 'angular', 'frontend'],
      java: ['java', 'spring', 'android', 'backend', 'enterprise'],
      web: ['web development', 'html', 'css', 'frontend', 'backend', 'fullstack'],
      data: ['data science', 'analytics', 'sql', 'database', 'big data'],
      mobile: ['mobile', 'app development', 'android', 'ios', 'flutter'],
      cloud: ['cloud', 'aws', 'azure', 'devops', 'docker', 'kubernetes']
    }
  }
};

function recognizeIntent(message) {
  const lowerMessage = message.toLowerCase().trim();
  console.log('Processing message:', lowerMessage);
  
  // Check each intent
  for (const [intentName, intentData] of Object.entries(CHAT_INTENTS)) {
    console.log(`Checking intent: ${intentName}`);
    
    for (const pattern of intentData.patterns) {
      console.log(`  Checking pattern: "${pattern}" against "${lowerMessage}"`);
      if (lowerMessage.includes(pattern)) {
        console.log(`  ✅ MATCH FOUND!`);
        return {
          intent: intentName,
          confidence: 0.8,
          matchedPattern: pattern
        };
      }
    }
  }
  
  // Technology-specific course recommendations
  if (CHAT_INTENTS.course_recommendation.technologies) {
    console.log('Checking technology keywords...');
    for (const [tech, keywords] of Object.entries(CHAT_INTENTS.course_recommendation.technologies)) {
      console.log(`  Checking tech: ${tech}`);
      for (const keyword of keywords) {
        console.log(`    Checking keyword: "${keyword}" against "${lowerMessage}"`);
        if (lowerMessage.includes(keyword)) {
          console.log(`    ✅ TECH MATCH FOUND!`);
          return {
            intent: 'course_recommendation',
            technology: tech,
            confidence: 0.9,
            matchedPattern: keyword
          };
        }
      }
    }
  }
  
  console.log('❌ No match found');
  return { intent: 'unknown', confidence: 0.1 };
}

// Test the problematic messages
console.log('='.repeat(60));
console.log('Testing: "What are the trending programming topics?"');
console.log('='.repeat(60));
const result1 = recognizeIntent("What are the trending programming topics?");
console.log('Result:', result1);

console.log('\n' + '='.repeat(60));
console.log('Testing: "python"');
console.log('='.repeat(60));
const result2 = recognizeIntent("python");
console.log('Result:', result2);

console.log('\n' + '='.repeat(60));
console.log('Testing: "trending"');
console.log('='.repeat(60));
const result3 = recognizeIntent("trending");
console.log('Result:', result3);