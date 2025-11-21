// Simple test to find the correct Gemini model
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function testGeminiModels() {
  console.log('🔍 Testing Gemini AI models...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found');
    return;
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try different model names
  const modelNames = [
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'text-bison-001'
  ];
  
  for (const modelName of modelNames) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Hello, can you respond?");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`);
      break;
      
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
    }
  }
}

testGeminiModels().catch(console.error);