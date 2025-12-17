// List available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function listModels() {
  try {
    console.log('🔍 Checking available Gemini models...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try the newer API
    const models = await genAI.listModels();
    
    console.log('✅ Available models:');
    for await (const model of models) {
      console.log(`- ${model.name}: ${model.description}`);
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    
    // Try with common model names
    console.log('\n🔧 Trying common model names...');
    const commonModels = ['gemini-pro', 'gemini-1.0-pro', 'text-bison', 'gemini-1.5-flash-latest'];
    
    for (const modelName of commonModels) {
      try {
        console.log(`Testing ${modelName}...`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello');
        console.log(`✅ ${modelName} works!`);
        break;
      } catch (e) {
        console.log(`❌ ${modelName} failed: ${e.message.substring(0, 100)}...`);
      }
    }
  }
}

listModels();