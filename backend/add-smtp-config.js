const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const smtpConfig = `
# Email SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sudeeepk07@gmail.com
SMTP_PASS=urjambzzqzihuzkp
FROM_EMAIL=sudeeepk07@gmail.com
`;

try {
  // Read current .env content
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Check if SMTP config already exists
  if (envContent.includes('SMTP_HOST')) {
    console.log('✅ SMTP configuration already exists in .env file');
    return;
  }
  
  // Append SMTP configuration
  const updatedContent = envContent + smtpConfig;
  fs.writeFileSync(envPath, updatedContent);
  
  console.log('✅ SMTP configuration added to .env file');
  console.log('📧 Email credentials configured:');
  console.log('   SMTP_USER: sudeeepk07@gmail.com');
  console.log('   SMTP_PASS: ***configured***');
  console.log('\n🔄 Please restart the server to apply changes');
  
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
}
