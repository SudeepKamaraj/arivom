import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { fetchWithAuth } from '../services/apiService';

// Supported programming languages configuration
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

// Theme configurations
const THEMES = [
  { name: 'vs-dark', label: 'Dark' },
  { name: 'light', label: 'Light' },
  { name: 'hc-black', label: 'High Contrast' },
];

// Default code templates for each language
const DEFAULT_CODE = {
  javascript: `// JavaScript Example
console.log("Hello, World!");

// Function example
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci of 10:", fibonacci(10));`,
  
  python: `# Python Example
print("Hello, World!")

# Function example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci of 10: {fibonacci(10)}")`,

  java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        System.out.println("Fibonacci of 10: " + fibonacci(10));
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,

  cpp: `// C++ Example
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Fibonacci of 10: " << fibonacci(10) << endl;
    return 0;
}`,

  c: `// C Example
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Hello, World!\\n");
    printf("Fibonacci of 10: %d\\n", fibonacci(10));
    return 0;
}`,

  csharp: `// C# Example
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        Console.WriteLine($"Fibonacci of 10: {Fibonacci(10)}");
    }
    
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}`,

  go: `// Go Example
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Printf("Fibonacci of 10: %d\\n", fibonacci(10))
}`,

  php: `<?php
// PHP Example
echo "Hello, World!\\n";

function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo "Fibonacci of 10: " . fibonacci(10) . "\\n";
?>`,

  ruby: `# Ruby Example
puts "Hello, World!"

def fibonacci(n)
    return n if n <= 1
    fibonacci(n - 1) + fibonacci(n - 2)
end

puts "Fibonacci of 10: #{fibonacci(10)}"`,

  rust: `// Rust Example
fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    println!("Hello, World!");
    println!("Fibonacci of 10: {}", fibonacci(10));
}`,

  kotlin: `// Kotlin Example
fun fibonacci(n: Int): Int {
    return if (n <= 1) n else fibonacci(n - 1) + fibonacci(n - 2)
}

fun main() {
    println("Hello, World!")
    println("Fibonacci of 10: \${fibonacci(10)}")
}`,

  typescript: `// TypeScript Example
function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Hello, World!");
console.log(\`Fibonacci of 10: \${fibonacci(10)}\`);`,
};

interface CodeExecutionResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status?: {
    id: number;
    description: string;
  };
  time?: string;
  memory?: number;
}

interface CodeEditorProps {
  courseId?: string;
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
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  // Filter languages based on course configuration
  const availableLanguages = LANGUAGES.filter(lang => 
    supportedLanguages.length === 0 || 
    supportedLanguages.includes(lang.name.toLowerCase()) ||
    supportedLanguages.includes(lang.monacoLanguage)
  );

  useEffect(() => {
    // Set default code when language changes
    if (!initialCode) {
      const defaultCode = DEFAULT_CODE[language as keyof typeof DEFAULT_CODE];
      if (defaultCode) {
        setCode(defaultCode);
      }
    }
  }, [language, initialCode]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!initialCode) {
      const defaultCode = DEFAULT_CODE[newLanguage as keyof typeof DEFAULT_CODE];
      if (defaultCode) {
        setCode(defaultCode);
      }
    }
  };

  const executeCode = async () => {
    if (!code.trim()) {
      setOutput('Error: Please enter some code to execute.');
      return;
    }

    const selectedLanguage = LANGUAGES.find(lang => lang.monacoLanguage === language);
    if (!selectedLanguage) {
      setOutput('Error: Language not supported for execution.');
      return;
    }

    setIsExecuting(true);
    setOutput('Executing...');

    try {
      const response = await fetchWithAuth('/code/execute', {
        method: 'POST',
        body: JSON.stringify({
          source_code: code,
          language_id: selectedLanguage.id,
          stdin: input
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const result: CodeExecutionResult = await response.json();
      
      let outputText = '';
      
      if (result.stdout) {
        outputText += `Output:\n${result.stdout}\n`;
      }
      
      if (result.stderr) {
        outputText += `Error:\n${result.stderr}\n`;
      }
      
      if (result.compile_output) {
        outputText += `Compilation Output:\n${result.compile_output}\n`;
      }
      
      if (result.status) {
        outputText += `\nStatus: ${result.status.description}`;
      }
      
      if (result.time) {
        outputText += `\nExecution Time: ${result.time}s`;
      }
      
      if (result.memory) {
        outputText += `\nMemory Used: ${result.memory} KB`;
      }

      setOutput(outputText || 'No output');
      
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    const defaultCode = DEFAULT_CODE[language as keyof typeof DEFAULT_CODE];
    setCode(defaultCode || '');
    setOutput('');
    setInput('');
  };

  const downloadCode = () => {
    const selectedLanguage = LANGUAGES.find(lang => lang.monacoLanguage === language);
    const extension = selectedLanguage?.extension || 'txt';
    const filename = `code.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Language:</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={readOnly}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.monacoLanguage} value={lang.monacoLanguage}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Theme:</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {THEMES.map((themeOption) => (
                  <option key={themeOption.name} value={themeOption.name}>
                    {themeOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex items-center gap-2">
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V4a2 2 0 00-2-2H5a2 2 0 00-2 2v3m2 13h10a2 2 0 002-2v-3" />
                    </svg>
                    Run Code
                  </>
                )}
              </button>
              
              <button
                onClick={resetCode}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Reset
              </button>
              
              <button
                onClick={downloadCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <Editor
          height={height}
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme={theme}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: readOnly,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
          }}
        />
      </div>

      {/* Input Section */}
      {!readOnly && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input (stdin):
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for your program here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Output:</h4>
              <button
                onClick={() => setOutput('')}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <pre className="bg-black text-green-400 p-3 rounded-md text-sm overflow-auto max-h-60 font-mono">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;