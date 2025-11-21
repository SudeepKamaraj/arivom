// Test API key validity
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function testAPIKey() {
  console.log('🔑 Testing Gemini API Key validity...');
  console.log('API Key:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try the simplest available model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    });
    
    console.log('✅ Model created successfully');
    
    const prompt = 'Say hello in one sentence.';
    console.log('📝 Testing with prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Gemini API is working!');
    console.log('🤖 Response:', text);
    
    return true;
    
  } catch (error) {
    console.error('❌ API Key test failed:', error.message);
    console.error('💡 Possible solutions:');
    console.error('   1. Check if API key is correct');
    console.error('   2. Ensure Gemini API is enabled in Google Cloud Console');
    console.error('   3. Verify billing is set up for the project');
    console.error('   4. Check API quotas and usage limits');
    return false;
  }
}

testAPIKey();