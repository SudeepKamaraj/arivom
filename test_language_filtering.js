// Test language filtering logic
const LANGUAGES = [
  { id: 63, name: 'JavaScript', label: 'JavaScript (Node.js)', extension: 'js', monacoLanguage: 'javascript' },
  { id: 71, name: 'Python', label: 'Python 3', extension: 'py', monacoLanguage: 'python' },
  { id: 62, name: 'Java', label: 'Java', extension: 'java', monacoLanguage: 'java' },
  { id: 54, name: 'C++', label: 'C++ (GCC)', extension: 'cpp', monacoLanguage: 'cpp' },
  { id: 50, name: 'C', label: 'C (GCC)', extension: 'c', monacoLanguage: 'c' },
  { id: 51, name: 'C#', label: 'C#', extension: 'cs', monacoLanguage: 'csharp' },
  { id: 60, name: 'Go', label: 'Go', extension: 'go', monacoLanguage: 'go' },
  { id: 68, name: 'PHP', label: 'PHP', extension: 'php', monacoLanguage: 'php' },
  { id: 72, name: 'Ruby', label: 'Ruby', extension: 'rb', monacoLanguage: 'ruby' },
  { id: 73, name: 'Rust', label: 'Rust', extension: 'rs', monacoLanguage: 'rust' },
  { id: 78, name: 'Kotlin', label: 'Kotlin', extension: 'kt', monacoLanguage: 'kotlin' },
  { id: 74, name: 'TypeScript', label: 'TypeScript', extension: 'ts', monacoLanguage: 'typescript' },
];

// Test with database languages from a sample course
const supportedLanguages = [
  "java",
  "javascript", 
  "python",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust"
];

console.log('Database supported languages:', supportedLanguages);

// New filtering logic
const availableLanguages = LANGUAGES.filter(lang => {
  if (supportedLanguages.length === 0) return true;
  
  // Check multiple matching criteria
  const langMatches = [
    lang.name.toLowerCase(),           // "javascript", "python", "java", "c++"
    lang.monacoLanguage,              // "javascript", "python", "java", "cpp"
    lang.extension,                   // "js", "py", "java", "cpp"
    lang.name                         // "JavaScript", "Python", "Java", "C++"
  ];
  
  return supportedLanguages.some(supportedLang => 
    langMatches.includes(supportedLang.toLowerCase()) ||
    langMatches.includes(supportedLang)
  );
});

console.log('Available languages after filtering:');
availableLanguages.forEach(lang => {
  console.log(`- ${lang.name} (${lang.monacoLanguage})`);
});

console.log('\nExpected: Should show Java, JavaScript, Python, C++, C, C#, PHP, Ruby, Go, Rust');
console.log(`Actual count: ${availableLanguages.length}/10 languages`);