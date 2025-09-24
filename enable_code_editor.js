// Script to enable code editor for a specific course
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5001/api';
const COURSE_ID = '68d2d007e422fbaccf02ef5b'; // Replace with your course ID

async function enableCodeEditor() {
    console.log('🔧 Enabling Code Editor for Course...\n');

    try {
        // First, get the current course data
        console.log('1️⃣ Fetching current course data...');
        const getResponse = await fetch(`${API_BASE_URL}/courses/${COURSE_ID}`);
        const currentCourse = await getResponse.json();
        
        if (!getResponse.ok) {
            console.log('❌ Failed to fetch course:', currentCourse.message);
            return;
        }

        console.log('   Course found:', currentCourse.title);
        console.log('   Current codeEditor config:', currentCourse.codeEditor);

        // Update course with code editor settings
        console.log('\n2️⃣ Updating course with code editor settings...');
        
        const updatedCourse = {
            ...currentCourse,
            codeEditor: {
                enabled: true,
                supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c'],
                defaultLanguage: 'javascript',
                defaultCode: '// Welcome to the interactive code editor!\n// Try writing some code here\n\nconsole.log("Hello, World!");\n\n// Available languages: JavaScript, Python, Java, C++, C\n// You can change the language using the dropdown above',
                allowExecution: true,
                showThemes: true
            }
        };

        // Note: You'll need admin credentials or modify this to work with your auth system
        const updateResponse = await fetch(`${API_BASE_URL}/courses/${COURSE_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // Add if needed
            },
            body: JSON.stringify(updatedCourse)
        });

        if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log('✅ Code editor enabled successfully!');
            console.log('   Supported languages:', result.codeEditor.supportedLanguages);
            console.log('   Default language:', result.codeEditor.defaultLanguage);
            console.log('   Execution allowed:', result.codeEditor.allowExecution);
            console.log('\n🎯 Refresh your course page to see the code editor!');
        } else {
            const error = await updateResponse.json();
            console.log('❌ Failed to update course:', error.message);
            console.log('   You may need to add authentication or admin privileges');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Alternative: Direct database update (if the API update fails)
async function enableCodeEditorDirectDB() {
    console.log('\n🔧 Alternative: Direct Database Update');
    console.log('If the API update failed, you can run this in your backend:');
    console.log(`
const Course = require('./models/Course');

async function updateCourse() {
    try {
        const result = await Course.findByIdAndUpdate('${COURSE_ID}', {
            $set: {
                'codeEditor.enabled': true,
                'codeEditor.supportedLanguages': ['javascript', 'python', 'java', 'cpp', 'c'],
                'codeEditor.defaultLanguage': 'javascript',
                'codeEditor.defaultCode': '// Welcome to the interactive code editor!\\n// Try writing some code here\\n\\nconsole.log("Hello, World!");\\n\\n// Available languages: JavaScript, Python, Java, C++, C\\n// You can change the language using the dropdown above',
                'codeEditor.allowExecution': true,
                'codeEditor.showThemes': true
            }
        }, { new: true });
        
        console.log('Code editor enabled:', result.codeEditor);
    } catch (error) {
        console.error('Error:', error);
    }
}

updateCourse();
    `);
}

console.log('🚀 Code Editor Enabler Script');
console.log('================================\n');
enableCodeEditor().then(() => {
    enableCodeEditorDirectDB();
});