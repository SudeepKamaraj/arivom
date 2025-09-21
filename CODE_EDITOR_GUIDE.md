# Code Editor Integration Guide

## Overview

The Course Recommendation System now includes a powerful interactive code editor that supports 40+ programming languages with compilation and execution capabilities. This feature is perfect for programming courses and allows students to practice coding directly within the platform.

## Features

✅ **40+ Programming Languages** - JavaScript, Python, Java, C++, C, C#, Go, PHP, Ruby, Rust, Kotlin, TypeScript, and more
✅ **Real-time Code Execution** - Compile and run code using Judge0 API
✅ **Syntax Highlighting** - Powered by Monaco Editor (VS Code editor)
✅ **Multiple Themes** - Dark, Light, and High Contrast themes
✅ **Admin Controls** - Enable/disable per course with language selection
✅ **Customizable** - Set default code templates and supported languages
✅ **Input/Output Support** - Provide stdin input and view execution results
✅ **Download Code** - Students can download their code files
✅ **Error Handling** - Display compilation errors and runtime exceptions

## Setup Instructions

### 1. Get Judge0 API Key

1. Visit [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce/)
2. Sign up for a free account
3. Subscribe to the Judge0 CE plan (free tier available)
4. Copy your API key

### 2. Configure Backend

1. Add your API key to the `.env` file in the backend directory:
```env
# Judge0 API Configuration (for code execution)
RAPIDAPI_KEY=your-rapidapi-key-here
```

2. The backend routes are already configured in `/api/code/`

### 3. Course Configuration

#### For Admins/Instructors:

1. **Create a New Course** or **Edit Existing Course**
2. Scroll to the **"Programming Course Settings"** section
3. Check **"Enable Code Editor"**
4. Select **supported programming languages** (check multiple)
5. Choose a **default language**
6. Optionally add a **default code template**
7. Configure additional options:
   - **Allow Code Execution**: Students can run code
   - **Show Theme Options**: Students can change editor themes

#### Example Configuration:
- **Supported Languages**: ✅ JavaScript, ✅ Python, ✅ Java
- **Default Language**: JavaScript
- **Default Code**: 
```javascript
// Welcome to the course!
// Practice your JavaScript skills here

function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("Student"));
```

### 4. Student Experience

When students access a course with code editor enabled:

1. **Interactive Code Editor** appears below the course description
2. **Language Selector** - Switch between supported languages
3. **Theme Selector** - Choose editor appearance
4. **Code Input** - Write code with syntax highlighting
5. **Input Section** - Provide stdin input if needed
6. **Run Code Button** - Execute code and see results
7. **Download Button** - Save code to local file
8. **Reset Button** - Restore default code template

## API Endpoints

### Code Execution
```http
POST /api/code/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_code": "console.log('Hello World');",
  "language_id": 63,
  "stdin": ""
}
```

### Get Supported Languages
```http
GET /api/code/languages
```

### Check Execution Status
```http
GET /api/code/status/:token
Authorization: Bearer <token>
```

## Supported Languages

| Language | ID | Extension | Monaco Language |
|----------|----|-----------|--------------  |
| JavaScript | 63 | .js | javascript |
| Python 3 | 71 | .py | python |
| Java | 62 | .java | java |
| C++ (GCC) | 54 | .cpp | cpp |
| C (GCC) | 50 | .c | c |
| C# | 51 | .cs | csharp |
| Go | 60 | .go | go |
| PHP | 68 | .php | php |
| Ruby | 72 | .rb | ruby |
| Rust | 73 | .rs | rust |
| Kotlin | 78 | .kt | kotlin |
| TypeScript | 74 | .ts | typescript |

## Course Model Schema

The Course model has been extended with the following fields:

```javascript
codeEditor: {
  enabled: { type: Boolean, default: false },
  supportedLanguages: [{ type: String, enum: [...] }],
  defaultLanguage: { type: String, default: 'javascript' },
  defaultCode: { type: String, default: '' },
  allowExecution: { type: Boolean, default: true },
  showThemes: { type: Boolean, default: true }
}
```

## Security Considerations

- **API Rate Limiting**: Judge0 API has rate limits on free tier
- **Code Sandboxing**: All code execution happens in Judge0's secure sandbox
- **Authentication**: Code execution requires user authentication
- **Input Validation**: Code and input are validated before submission

## Troubleshooting

### Common Issues:

1. **"Failed to execute code" Error**
   - Check if RAPIDAPI_KEY is set correctly
   - Verify Judge0 subscription is active
   - Check network connectivity

2. **Code Editor Not Appearing**
   - Ensure `codeEditor.enabled` is true for the course
   - Check if user has access to the course
   - Verify CodeEditor component is imported

3. **Language Not Working**
   - Check if language is in supportedLanguages array
   - Verify language ID mapping in LANGUAGES constant

4. **Compilation Errors**
   - Check syntax of the code
   - Verify language-specific requirements
   - Review Judge0 API documentation

## Testing

### Test Code Samples:

**JavaScript:**
```javascript
console.log("Hello World!");
console.log(2 + 3);
```

**Python:**
```python
print("Hello World!")
print(2 + 3)
```

**Java:**
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        System.out.println(2 + 3);
    }
}
```

## Future Enhancements

- [ ] Save student code progress
- [ ] Code sharing functionality  
- [ ] Code challenges and exercises
- [ ] Automated testing capabilities
- [ ] Performance metrics and analytics
- [ ] Collaborative coding features
- [ ] Integration with version control systems

## Support

For technical support or questions about the code editor feature:

1. Check the console for error messages
2. Verify API key configuration
3. Test with simple code samples
4. Review Judge0 API status and limits
5. Contact development team with specific error details

---

**Happy Coding! 🚀**