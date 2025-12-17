// List available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function listGeminiModels() {
  console.log('📋 Listing available Gemini AI models...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY not found');
    return;
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // List all available models
    const models = await genAI.listModels();
    
    console.log('Available models:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
    
    // Try to find a working model
    const workingModels = models.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    );
    
    if (workingModels.length > 0) {
      console.log('🎯 Models that support generateContent:');
      workingModels.forEach(model => {
        const modelId = model.name.split('/').pop();
        console.log(`   - ${modelId}`);
      });
      
      // Test the first working model
      const testModel = workingModels[0];
      const modelId = testModel.name.split('/').pop();
      
      console.log(`\n🧪 Testing model: ${modelId}`);
      const model = genAI.getGenerativeModel({ model: modelId });
      
      const result = await model.generateContent("Hello! Please respond with a brief greeting.");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS! Model ${modelId} works!`);
      console.log(`Response: ${text}`);
      
      return modelId;
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    
    // If API key is invalid, let's test it
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
      console.log('\n🔍 Testing API key validity...');
      console.log('API Key format check:', process.env.GEMINI_API_KEY.startsWith('AIza') ? '✅ Valid format' : '❌ Invalid format');
      console.log('API Key length:', process.env.GEMINI_API_KEY.length, '(should be 39)');
    }
  }
}

listGeminiModels().catch(console.error);