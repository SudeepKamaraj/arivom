// Script to update all localhost URLs to use the hosted backend
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'project', 'src', 'components');
const files = [
  'ReviewSection.tsx',
  'Assessment.tsx', 
  'Certificate.tsx',
  'CodeEditor.tsx',
  'CourseCompletionModal.tsx',
  'CourseDetail.tsx',
  'Dashboard.tsx',
  'VideoPlayer.tsx',
  'CourseCompletion.tsx'
];

// Add import for getApiUrl at the top of each file and replace localhost URLs
files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not already present
    if (!content.includes("import { getApiUrl }")) {
      // Find the last import statement
      const importRegex = /import[^;]+;/g;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        content = content.replace(lastImport, lastImport + "\nimport { getApiUrl } from '../utils/apiConfig';");
      }
    }
    
    // Replace localhost URLs with getApiUrl calls
    content = content.replace(/http:\/\/localhost:5001\/api\/([^'"`]+)/g, "' + getApiUrl('$1') + '");
    content = content.replace(/`http:\/\/localhost:5001\/api\/([^`]+)`/g, "getApiUrl('$1')");
    content = content.replace(/'http:\/\/localhost:5001\/api\/([^']+)'/g, "getApiUrl('$1')");
    content = content.replace(/"http:\/\/localhost:5001\/api\/([^"]+)"/g, "getApiUrl('$1')");
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});

console.log('All component files updated!');