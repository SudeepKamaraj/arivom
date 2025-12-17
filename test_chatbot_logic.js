// Test the exact logic flow that should happen in the chatbot

// Mock the intent recognition and response generation from the backend
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
  
  // Check each intent
  for (const [intentName, intentData] of Object.entries(CHAT_INTENTS)) {
    for (const pattern of intentData.patterns) {
      if (lowerMessage.includes(pattern)) {
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
    for (const [tech, keywords] of Object.entries(CHAT_INTENTS.course_recommendation.technologies)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
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
  
  return { intent: 'unknown', confidence: 0.1 };
}

function generateDefaultResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Try to provide intelligent responses for common unmatched queries
  if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('hot')) {
    return {
      text: `🔥 **Trending Programming Topics & Technologies:**\n\n🚀 **Most Popular Right Now:**\n• **Python** - AI/ML, Data Science, Web Development\n• **JavaScript** - Full-stack Development, React, Node.js\n• **Cloud Computing** - AWS, Azure, DevOps\n• **AI & Machine Learning** - ChatGPT, Computer Vision\n• **Web3 & Blockchain** - Smart Contracts, DeFi\n• **Mobile Development** - React Native, Flutter\n\n📈 **Growing Fast:**\n• **Rust** - System programming, performance\n• **Go** - Microservices, backend development\n• **TypeScript** - Type-safe JavaScript\n• **Kubernetes** - Container orchestration\n\n💡 **Want to dive deeper?** Ask me:\n• "Recommend Python courses"\n• "Show me AI courses"\n• "Best JavaScript learning path"\n• "Cloud development courses"\n\nWhat technology interests you most? 🎯`,
      type: 'course-recommendation'
    };
  }
  
  if (lowerMessage.includes('python')) {
    return {
      text: `🐍 **Python is an excellent choice!** It's perfect for:\n\n🔥 **Hot Career Paths:**\n• **Data Science & Analytics** - High demand, great pay\n• **AI & Machine Learning** - Future-proof skills\n• **Web Development** - Django, Flask frameworks\n• **Automation & Scripting** - Save time, boost productivity\n• **Game Development** - Fun projects with Pygame\n\n📚 **Python Learning Path:**\n1. **Basics** - Syntax, variables, functions\n2. **Data Structures** - Lists, dictionaries, sets\n3. **Object-Oriented Programming** - Classes, inheritance\n4. **Libraries** - NumPy, Pandas, Matplotlib\n5. **Frameworks** - Django/Flask for web, TensorFlow for AI\n\n💡 **Ready to start?** Try asking:\n• "Recommend Python courses for beginners"\n• "Python for data science"\n• "Best Python projects for practice"\n\nWhat's your experience level with Python? 🎯`,
      type: 'course-recommendation'
    };
  }
  
  return {
    text: `I understand you're asking about "${message}". Let me help you!`,
    type: 'text'
  };
}

function simulateGenerateResponse(intent, message) {
  if (intent.intent === 'course_recommendation') {
    return {
      text: "🎯 **Course Recommendations:** Based on your interest in " + (intent.technology || 'general learning') + ", here are some suggestions...",
      type: 'course-recommendation'
    };
  } else if (intent.intent === 'unknown') {
    return generateDefaultResponse(message);
  } else {
    return {
      text: "I can help you with " + intent.intent,
      type: 'text'
    };
  }
}

// Test the problematic messages
console.log('🧪 Testing Chatbot Logic Flow...\n');

const testMessages = [
  "What are the trending programming topics?",
  "python",
  "Hello there"
];

testMessages.forEach((message, index) => {
  console.log(`${index + 1}️⃣ Testing: "${message}"`);
  
  // Step 1: Recognize intent
  const intent = recognizeIntent(message);
  console.log('   Intent:', intent);
  
  // Step 2: Generate response
  const response = simulateGenerateResponse(intent, message);
  console.log('   Response type:', response.type);
  console.log('   Response preview:', response.text.substring(0, 100) + '...\n');
  
  console.log('='.repeat(60) + '\n');
});

console.log('✅ All tests completed! The logic should now provide intelligent responses.');