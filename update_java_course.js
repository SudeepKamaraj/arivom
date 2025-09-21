const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-recommendation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: mongoose.Schema.Types.ObjectId,
  category: String,
  level: String,
  duration: Number,
  price: Number,
  thumbnail: String,
  videos: Array,
  students: Array,
  rating: Object,
  tags: [String],
  codeEditor: {
    enabled: { type: Boolean, default: false },
    supportedLanguages: [String],
    defaultLanguage: { type: String, default: 'javascript' },
    defaultCode: { type: String, default: '' },
    allowExecution: { type: Boolean, default: true },
    showThemes: { type: Boolean, default: true }
  },
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

async function updateJavaCourseWithCodeEditor() {
  try {
    console.log('🔍 Searching for Java course...');
    
    // Find the Java course
    const javaCourse = await Course.findOne({ 
      $or: [
        { title: /java/i },
        { category: /java/i },
        { tags: { $in: [/java/i] } }
      ]
    });

    if (!javaCourse) {
      console.log('❌ Java course not found. Creating a sample Java course...');
      
      // Create a new Java course with code editor
      const newJavaCourse = new Course({
        title: 'JAVA',
        description: 'Learn and enjoy Java programming with hands-on coding exercises. Master object-oriented programming concepts with our interactive code editor.',
        category: 'Programming',
        level: 'beginner',
        duration: 60, // 1 hour
        price: 0, // Free
        thumbnail: 'https://via.placeholder.com/400x200/ED8B00/FFFFFF?text=Java+Course',
        videos: [{
          title: 'JAVA',
          description: 'Introduction to Java programming',
          url: '/static/videos/java-intro.mp4',
          duration: 3600, // 1 hour in seconds
          thumbnail: 'https://via.placeholder.com/200x120/ED8B00/FFFFFF?text=Java',
          order: 1
        }],
        students: [],
        rating: { average: 4.7, count: 0 },
        tags: ['java', 'programming language'],
        codeEditor: {
          enabled: true,
          supportedLanguages: ['java', 'javascript', 'python', 'cpp'],
          defaultLanguage: 'java',
          defaultCode: `// Welcome to Java Programming!
// Let's start with a simple Hello World program

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java programming!");
        
        // Try modifying this code and click 'Run Code'
        String courseName = "Java Programming";
        int lessonNumber = 1;
        
        System.out.println("Course: " + courseName);
        System.out.println("Lesson: " + lessonNumber);
    }
}`,
          allowExecution: true,
          showThemes: true
        },
        isPublished: true
      });

      await newJavaCourse.save();
      console.log('✅ Created new Java course with code editor!');
      
    } else {
      console.log('✅ Found Java course:', javaCourse.title);
      
      // Update the existing course with code editor configuration
      javaCourse.codeEditor = {
        enabled: true,
        supportedLanguages: ['java', 'javascript', 'python', 'cpp'],
        defaultLanguage: 'java',
        defaultCode: `// Welcome to Java Programming!
// Let's start with a simple Hello World program

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java programming!");
        
        // Try modifying this code and click 'Run Code'
        String courseName = "Java Programming";
        int lessonNumber = 1;
        
        System.out.println("Course: " + courseName);
        System.out.println("Lesson: " + lessonNumber);
    }
}`,
        allowExecution: true,
        showThemes: true
      };

      await javaCourse.save();
      console.log('✅ Updated Java course with code editor configuration!');
    }

    // Verify the update
    const updatedCourse = await Course.findOne({ 
      $or: [
        { title: /java/i },
        { category: /java/i },
        { tags: { $in: [/java/i] } }
      ]
    });

    console.log('📊 Course verification:', {
      title: updatedCourse.title,
      codeEditorEnabled: updatedCourse.codeEditor?.enabled,
      supportedLanguages: updatedCourse.codeEditor?.supportedLanguages,
      defaultLanguage: updatedCourse.codeEditor?.defaultLanguage
    });

    console.log('🎉 Java course is now ready with code editor!');

  } catch (error) {
    console.error('❌ Error updating course:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the update
updateJavaCourseWithCodeEditor();