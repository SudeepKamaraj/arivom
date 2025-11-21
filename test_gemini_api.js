// Test Gemini API with standard approach
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API with standard models...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found');
    return;
  }
  
  console.log('API Key format:', process.env.GEMINI_API_KEY.startsWith('AIza') ? '✅ Valid' : '❌ Invalid');
  console.log('API Key length:', process.env.GEMINI_API_KEY.length);
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try the most common working models for the current API
  const modelsToTry = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest', 
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'models/gemini-pro',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro'
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🔧 Trying model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = "Hello! Please respond with a simple greeting. Keep it brief.";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS! Model "${modelName}" works!`);
      console.log(`Response: ${text.trim()}`);
      
      // Update the service file with the working model
      const fs = require('fs');
      const servicePath = './backend/services/geminiAI.js';
      let serviceContent = fs.readFileSync(servicePath, 'utf8');
      
      // Replace the model name in the service file
      const updatedContent = serviceContent.replace(
        /this\.model = this\.genAI\.getGenerativeModel\(\{ model: '[^']+' \}\);/,
        `this.model = this.genAI.getGenerativeModel({ model: '${modelName}' });`
      );
      
      fs.writeFileSync(servicePath, updatedContent);
      console.log(`✅ Updated service file with working model: ${modelName}`);
      
      return modelName;
      
    } catch (error) {
      console.log(`❌ Model "${modelName}" failed:`, error.message.split('\n')[0]);
    }
  }
  
  console.log('\n❌ No working models found. The API key might be invalid or expired.');
  console.log('💡 Try generating a new API key at: https://makersuite.google.com/app/apikey');
}

testGeminiAPI().catch(console.error);