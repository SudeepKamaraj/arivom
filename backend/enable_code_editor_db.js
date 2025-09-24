// Direct database script to enable code editor for a course
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Course model
const Course = require('./models/Course');

const COURSE_ID = '68d2d007e422fbaccf02ef5b'; // Your course ID

async function enableCodeEditor() {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n🔍 Finding course...');
        const course = await Course.findById(COURSE_ID);
        
        if (!course) {
            console.log('❌ Course not found with ID:', COURSE_ID);
            return;
        }

        console.log('✅ Course found:', course.title);
        console.log('📊 Current codeEditor config:', course.codeEditor);

        console.log('\n🔧 Updating course with code editor settings...');
        
        const updatedCourse = await Course.findByIdAndUpdate(COURSE_ID, {
            $set: {
                'codeEditor.enabled': true,
                'codeEditor.supportedLanguages': ['javascript', 'python', 'java', 'cpp', 'c'],
                'codeEditor.defaultLanguage': 'javascript',
                'codeEditor.defaultCode': `// Welcome to the interactive code editor!
// Try writing some code here

console.log("Hello, World!");

// Available languages: JavaScript, Python, Java, C++, C
// You can change the language using the dropdown above

// Example functions:
function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("Student"));`,
                'codeEditor.allowExecution': true,
                'codeEditor.showThemes': true
            }
        }, { new: true });

        console.log('✅ Code editor enabled successfully!');
        console.log('📋 Updated settings:');
        console.log('   - Enabled:', updatedCourse.codeEditor.enabled);
        console.log('   - Supported Languages:', updatedCourse.codeEditor.supportedLanguages);
        console.log('   - Default Language:', updatedCourse.codeEditor.defaultLanguage);
        console.log('   - Allow Execution:', updatedCourse.codeEditor.allowExecution);
        console.log('   - Show Themes:', updatedCourse.codeEditor.showThemes);
        
        console.log('\n🎯 Refresh your course page to see the code editor!');

    } catch (error) {
        console.error('❌ Error enabling code editor:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

enableCodeEditor();