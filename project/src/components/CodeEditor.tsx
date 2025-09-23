import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { getApiUrl } from '../utils/apiConfig';

// Supported programming languages with Judge0 IDs
const LANGUAGES = [
  { id: 63, name: 'JavaScript', label: 'JavaScript (Node.js)', monacoLanguage: 'javascript' },
  { id: 71, name: 'Python', label: 'Python 3', monacoLanguage: 'python' },
  { id: 62, name: 'Java', label: 'Java', monacoLanguage: 'java' },
  { id: 54, name: 'C++', label: 'C++ (GCC)', monacoLanguage: 'cpp' },
  { id: 50, name: 'C', label: 'C (GCC)', monacoLanguage: 'c' },
  { id: 51, name: 'C#', label: 'C#', monacoLanguage: 'csharp' },
  { id: 60, name: 'Go', label: 'Go', monacoLanguage: 'go' },
  { id: 68, name: 'PHP', label: 'PHP', monacoLanguage: 'php' },
  { id: 72, name: 'Ruby', label: 'Ruby', monacoLanguage: 'ruby' },
  { id: 73, name: 'Rust', label: 'Rust', monacoLanguage: 'rust' },
  { id: 78, name: 'Kotlin', label: 'Kotlin', monacoLanguage: 'kotlin' },
  { id: 74, name: 'TypeScript', label: 'TypeScript', monacoLanguage: 'typescript' }
];

// Default code templates
const DEFAULT_CODE = {
  javascript: `// JavaScript Example
console.log("Hello, World!");

function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("Programmer"));`,
  
  python: `# Python Example
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

print(greet("Programmer"))`,
  
  java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println(greet("Programmer"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
  
  cpp: `// C++ Example
#include <iostream>
#include <string>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << "Hello, World!" << endl;
    cout << greet("Programmer") << endl;
    return 0;
}`,
  
  c: `// C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Hello, Programmer!\\n");
    return 0;
}`,
  
  csharp: `// C# Example
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        Console.WriteLine(Greet("Programmer"));
    }
    
    static string Greet(string name) {
        return $"Hello, {name}!";
    }
}`,
  
  go: `// Go Example
package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Println(greet("Programmer"))
}`,
  
  php: `<?php
// PHP Example
echo "Hello, World!\\n";

function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("Programmer");
?>`,
  
  ruby: `# Ruby Example
puts "Hello, World!"

def greet(name)
    "Hello, #{name}!"
end

puts greet("Programmer")`,
  
  rust: `// Rust Example
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("Hello, World!");
    println!("{}", greet("Programmer"));
}`,
  
  kotlin: `// Kotlin Example
fun greet(name: String): String {
    return "Hello, $name!"
}

fun main() {
    println("Hello, World!")
    println(greet("Programmer"))
}`,
  
  typescript: `// TypeScript Example
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

console.log("Hello, World!");
console.log(greet("Programmer"));`
};

interface CodeEditorProps {
  supportedLanguages?: string[];
  initialLanguage?: string;
  initialCode?: string;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  supportedLanguages = [],
  initialLanguage = 'javascript',
  initialCode = '',
  readOnly = false,
  height = '400px'
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [theme, setTheme] = useState<string>('vs-dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Filter available languages
  const availableLanguages = LANGUAGES.filter(lang => 
    supportedLanguages.length === 0 || 
    supportedLanguages.includes(lang.name.toLowerCase()) ||
    supportedLanguages.includes(lang.monacoLanguage)
  );

  // Load default code
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else if (!readOnly) {
      const defaultCode = DEFAULT_CODE[language as keyof typeof DEFAULT_CODE];
      if (defaultCode) {
        setCode(defaultCode);
      }
    }
  }, [language, initialCode, readOnly]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setOutput('');
    if (!readOnly) {
      const defaultCode = DEFAULT_CODE[newLanguage as keyof typeof DEFAULT_CODE];
      if (defaultCode) {
        setCode(defaultCode);
      }
    }
  };

  const executeCode = async () => {
    if (!code || code.trim().length === 0) {
      setOutput('❌ Error: Please enter some code to execute.');
      return;
    }

    setIsExecuting(true);
    setOutput('🔄 Executing code...');

    try {
      const selectedLanguage = LANGUAGES.find(lang => lang.monacoLanguage === language);
      if (!selectedLanguage) {
        setOutput('❌ Language not supported for execution');
        return;
      }

      const requestBody = {
        language_id: selectedLanguage.id,
        source_code: code,
        stdin: input || ''
      };

      const response = await fetch(getApiUrl('code/execute'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status?.description === 'Accepted') {
        setOutput(`✅ Output:\n${result.stdout || 'No output'}`);
      } else if (result.stderr) {
        setOutput(`❌ Error:\n${result.stderr}`);
      } else if (result.compile_output) {
        setOutput(`❌ Compilation Error:\n${result.compile_output}`);
      } else {
        setOutput(`❌ Execution failed: ${result.status?.description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Execution error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          setOutput(`❌ Network Error: Unable to connect to the execution server.\nPlease check your internet connection and try again.`);
        } else if (error.message.includes('HTTP error! status: 429')) {
          setOutput(`❌ Rate Limit: Too many requests. Please wait a moment and try again.`);
        } else if (error.message.includes('HTTP error! status: 500')) {
          setOutput(`❌ Server Error: The execution server is experiencing issues. Please try again later.`);
        } else {
          setOutput(`❌ Error: ${error.message}`);
        }
      } else {
        setOutput(`❌ Unknown error occurred. Please try again.`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    if (!readOnly) {
      const defaultCode = DEFAULT_CODE[language as keyof typeof DEFAULT_CODE];
      setCode(defaultCode || '// Write your code here');
    }
    setOutput('');
    setInput('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">{'</>'}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Interactive Code Editor</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {!readOnly && (
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableLanguages.map(lang => (
                  <option key={lang.monacoLanguage} value={lang.monacoLanguage}>
                    {lang.label}
                  </option>
                ))}
              </select>
            )}

            {readOnly && (
              <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
                {LANGUAGES.find(lang => lang.monacoLanguage === language)?.label || language}
              </span>
            )}

            {!readOnly && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                title="Settings"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                  <option value={20}>20px</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                <button
                  onClick={resetCode}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Reset Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      <div style={{ height: height }}>
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme={theme}
          options={{
            fontSize: fontSize,
            minimap: { enabled: false },
            readOnly: readOnly,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on'
          }}
        />
      </div>

      {/* Controls */}
      {!readOnly && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Input (stdin):</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input for your program..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={executeCode}
                disabled={isExecuting || readOnly}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Running...
                  </>
                ) : (
                  <>
                    ▶️ Run Code
                  </>
                )}
              </button>

              {!readOnly && (
                <button
                  onClick={resetCode}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  title="Reset to default code"
                >
                  🔄 Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Output:</h4>
            <pre className="bg-black text-green-400 p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              {output}
            </pre>
          </div>
        </div>
      )}

      {/* Tips */}
      {!readOnly && (
        <div className="border-t border-gray-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-600">
            💡 Tip: Write your code above, provide input if needed, and click "Run Code" to execute.
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
