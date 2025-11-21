// Final Gemini AI Test
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function testGeminiDirect() {
  console.log('🤖 Testing Gemini AI directly...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `You are an AI course recommendation assistant. A user says: "I want to learn programming as a complete beginner. What courses do you recommend?"
    
Please provide 3 specific course recommendations with brief explanations.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini AI Response:');
    console.log(text);
    
    console.log('\n🎉 Gemini AI integration is working perfectly!');
    console.log('\n📋 Next Steps:');
    console.log('1. Your Gemini API is properly configured');
    console.log('2. The service can generate course recommendations');
    console.log('3. You can now use the chatbot endpoints in your frontend:');
    console.log('   - POST /api/chat/gemini-chat (for AI-powered chat)');
    console.log('   - GET /api/chat/ai-recommendations (for direct recommendations)');
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error.message);
  }
}

testGeminiDirect();