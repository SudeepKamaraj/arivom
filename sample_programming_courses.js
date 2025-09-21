// Sample course data with code editor configuration
// Use this to test the code editor functionality

const sampleProgrammingCourse = {
  title: "JavaScript Fundamentals",
  description: "Learn the basics of JavaScript programming with hands-on coding exercises. This course includes an interactive code editor where you can practice writing and executing JavaScript code.",
  category: "Programming",
  level: "beginner",
  price: 0,
  duration: 120,
  thumbnail: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=JavaScript+Course",
  tags: ["javascript", "programming", "web development", "coding", "beginner"],
  instructorName: "John Doe",
  isPublished: true,
  
  // Code Editor Configuration
  codeEditor: {
    enabled: true,
    supportedLanguages: ["javascript", "python", "java", "cpp"],
    defaultLanguage: "javascript",
    defaultCode: `// Welcome to JavaScript Fundamentals!
// Let's start with a simple example

function greetStudent(name) {
    return \`Hello, \${name}! Welcome to coding!\`;
}

// Variables and data types
let courseName = "JavaScript Fundamentals";
let numberOfLessons = 10;
let isInteractive = true;

// Display information
console.log(greetStudent("Student"));
console.log("Course:", courseName);
console.log("Lessons:", numberOfLessons);
console.log("Interactive:", isInteractive);

// Try modifying this code and click 'Run Code' to see the results!`,
    allowExecution: true,
    showThemes: true
  },
  
  videos: [
    {
      title: "Introduction to JavaScript",
      description: "Learn what JavaScript is and why it's important",
      url: "/static/videos/intro-to-js.mp4",
      duration: 300,
      thumbnail: "https://via.placeholder.com/200x120/4F46E5/FFFFFF?text=Intro",
      order: 1
    },
    {
      title: "Variables and Data Types",
      description: "Understanding JavaScript variables and data types",
      url: "/static/videos/variables-datatypes.mp4", 
      duration: 450,
      thumbnail: "https://via.placeholder.com/200x120/059669/FFFFFF?text=Variables",
      order: 2
    },
    {
      title: "Functions and Scope",
      description: "Creating and using functions in JavaScript",
      url: "/static/videos/functions-scope.mp4",
      duration: 600,
      thumbnail: "https://via.placeholder.com/200x120/DC2626/FFFFFF?text=Functions",
      order: 3
    }
  ],

  assessments: [
    {
      title: "JavaScript Basics Quiz",
      description: "Test your knowledge of JavaScript fundamentals",
      questions: [
        {
          question: "What is the correct way to declare a variable in JavaScript?",
          options: [
            "var myVariable;",
            "variable myVariable;", 
            "v myVariable;",
            "declare myVariable;"
          ],
          correctAnswer: 0,
          explanation: "In JavaScript, variables are declared using 'var', 'let', or 'const' keywords."
        },
        {
          question: "Which of the following is a primitive data type in JavaScript?",
          options: [
            "Object",
            "Array",
            "String", 
            "Function"
          ],
          correctAnswer: 2,
          explanation: "String is a primitive data type in JavaScript, along with number, boolean, undefined, null, and symbol."
        },
        {
          question: "What does 'console.log()' do?",
          options: [
            "Creates a variable",
            "Displays output in the console",
            "Declares a function",
            "Imports a library"
          ],
          correctAnswer: 1,
          explanation: "console.log() is used to print/display information in the browser's console."
        }
      ],
      passingScore: 70
    }
  ]
};

// Sample Python course
const samplePythonCourse = {
  title: "Python Programming Basics",
  description: "Master the fundamentals of Python programming with interactive coding exercises. Practice Python syntax, data structures, and problem-solving with our built-in code editor.",
  category: "Programming",
  level: "beginner", 
  price: 29.99,
  duration: 180,
  thumbnail: "https://via.placeholder.com/400x200/3776AB/FFFFFF?text=Python+Course",
  tags: ["python", "programming", "data science", "coding", "beginner"],
  instructorName: "Jane Smith",
  isPublished: true,
  
  codeEditor: {
    enabled: true,
    supportedLanguages: ["python", "javascript", "java"],
    defaultLanguage: "python",
    defaultCode: `# Welcome to Python Programming Basics!
# Let's explore Python fundamentals

def greet_student(name):
    return f"Hello, {name}! Ready to learn Python?"

# Variables and data types
course_name = "Python Programming Basics"
number_of_lessons = 12
is_interactive = True
topics = ["variables", "functions", "loops", "data structures"]

# Display information
print(greet_student("Student"))
print(f"Course: {course_name}")
print(f"Lessons: {number_of_lessons}")
print(f"Interactive: {is_interactive}")
print(f"Topics covered: {', '.join(topics)}")

# Try modifying this code and run it!`,
    allowExecution: true,
    showThemes: true
  }
};

// Sample Java course
const sampleJavaCourse = {
  title: "Java Object-Oriented Programming",
  description: "Learn object-oriented programming concepts using Java. Build solid foundations with classes, objects, inheritance, and polymorphism using hands-on coding practice.",
  category: "Programming", 
  level: "intermediate",
  price: 49.99,
  duration: 240,
  thumbnail: "https://via.placeholder.com/400x200/ED8B00/FFFFFF?text=Java+Course",
  tags: ["java", "oop", "programming", "object-oriented", "intermediate"],
  instructorName: "Dr. Mike Johnson",
  isPublished: true,
  
  codeEditor: {
    enabled: true,
    supportedLanguages: ["java", "cpp", "csharp", "python"],
    defaultLanguage: "java",
    defaultCode: `// Welcome to Java Object-Oriented Programming!
// Let's start with a simple class example

public class Student {
    // Class attributes
    private String name;
    private String course;
    private int lessonProgress;
    
    // Constructor
    public Student(String name, String course) {
        this.name = name;
        this.course = course;
        this.lessonProgress = 0;
    }
    
    // Getter methods
    public String getName() {
        return name;
    }
    
    public String getCourse() {
        return course;
    }
    
    // Method to update progress
    public void completeLesson() {
        lessonProgress++;
        System.out.println(name + " completed lesson " + lessonProgress);
    }
    
    // Display student info
    public void displayInfo() {
        System.out.println("Student: " + name);
        System.out.println("Course: " + course);
        System.out.println("Lessons completed: " + lessonProgress);
    }
}

// Main class to test our Student class
public class Main {
    public static void main(String[] args) {
        Student student = new Student("Alex", "Java Programming");
        student.displayInfo();
        student.completeLesson();
        student.completeLesson();
        
        System.out.println("\\nWelcome to Java OOP!");
    }
}`,
    allowExecution: true,
    showThemes: true
  }
};

module.exports = {
  sampleProgrammingCourse,
  samplePythonCourse, 
  sampleJavaCourse
};

console.log("📚 Sample programming courses with code editor configured!");
console.log("Use these examples to test the code editor functionality.");
console.log("🔧 Make sure to set your RAPIDAPI_KEY in the backend .env file first!");