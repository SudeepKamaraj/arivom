const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');

// Judge0 API configuration - Using mock for testing
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'your-rapidapi-key-here';
const USE_MOCK = !process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'your-rapidapi-key-here';

// Mock execution function for testing
const mockExecution = (source_code, language_id) => {
  // Basic mock responses that can simulate actual code execution
  const extractOutput = (code, language_id) => {
    try {
      // JavaScript
      if (language_id === 63) {
        const consoleMatches = code.match(/console\.log\(['"`]([^'"`]*)['"`]\)/g);
        if (consoleMatches) {
          return consoleMatches.map(match => {
            const content = match.match(/console\.log\(['"`]([^'"`]*)['"`]\)/)[1];
            return content;
          }).join('\n') + '\n';
        }
      }
      
      // Python  
      if (language_id === 71) {
        const printMatches = code.match(/print\(['"`]([^'"`]*)['"`]\)/g);
        if (printMatches) {
          return printMatches.map(match => {
            const content = match.match(/print\(['"`]([^'"`]*)['"`]\)/)[1];
            return content;
          }).join('\n') + '\n';
        }
      }
      
      // Java
      if (language_id === 62) {
        const systemOutMatches = code.match(/System\.out\.println\(['"`]([^'"`]*)['"`]\)/g);
        if (systemOutMatches) {
          return systemOutMatches.map(match => {
            const content = match.match(/System\.out\.println\(['"`]([^'"`]*)['"`]\)/)[1];
            return content;
          }).join('\n') + '\n';
        }
      }
      
      // C/C++
      if (language_id === 50 || language_id === 54) {
        const printfMatches = code.match(/(?:printf|cout\s*<<)\s*['"`]([^'"`]*)['"`]/g);
        if (printfMatches) {
          return printfMatches.map(match => {
            const content = match.match(/['"`]([^'"`]*)['"`]/)[1];
            return content;
          }).join('\n') + '\n';
        }
      }
      
      // Default success message
      return 'Code executed successfully!\n';
    } catch (error) {
      return 'Hello, World!\n'; // Fallback
    }
  };

  // Check for simple syntax errors
  if (source_code.includes('syntax error') || source_code.includes('error')) {
    return {
      stdout: null,
      stderr: 'Compilation error: Syntax error detected',
      status: { id: 6, description: 'Compilation Error' },
      time: '0.001',
      memory: 0
    };
  }

  // Extract expected output based on the code
  console.log('Mock execution - Extracting output for language_id:', language_id);
  console.log('Mock execution - Source code:', source_code);
  const output = extractOutput(source_code, language_id);
  console.log('Mock execution - Extracted output:', output);
  
  // Language-specific mock responses with extracted output
  const mockResults = {
    63: { // JavaScript
      stdout: output,
      stderr: null,
      status: { id: 3, description: 'Accepted' },
      time: '0.001',
      memory: 2048
    },
    71: { // Python
      stdout: output,
      stderr: null,
      status: { id: 3, description: 'Accepted' },
      time: '0.002',
      memory: 3072
    },
    62: { // Java
      stdout: output,
      stderr: null,
      status: { id: 3, description: 'Accepted' },
      time: '0.5',
      memory: 15000
    },
    50: { // C
      stdout: output,
      stderr: null,
      status: { id: 3, description: 'Accepted' },
      time: '0.1',
      memory: 1024
    },
    54: { // C++
      stdout: output,
      stderr: null,
      status: { id: 3, description: 'Accepted' },
      time: '0.15',
      memory: 2048
    }
  };

  return mockResults[language_id] || {
    stdout: output,
    stderr: null,
    status: { id: 3, description: 'Accepted' },
    time: '0.001',
    memory: 1024
  };
};

/**
 * @route   POST /api/code/execute
 * @desc    Execute code using Judge0 API
 * @access  Private
 */
router.post('/execute', async (req, res) => {
  try {
    // Check auth only if not using mock
    if (!USE_MOCK) {
      // Apply auth middleware for real Judge0 API
      return auth(req, res, async () => {
        return executeCodeLogic(req, res);
      });
    }

    // For mock mode, allow without auth for testing
    return executeCodeLogic(req, res);
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const executeCodeLogic = async (req, res) => {
  try {
    const { source_code, language_id, stdin = '' } = req.body;

    if (!source_code || !language_id) {
      return res.status(400).json({ 
        message: 'Source code and language ID are required' 
      });
    }

    // Use mock execution if no API key is configured
    if (USE_MOCK) {
      // For mock mode, don't decode base64 - use source code as plain text
      let decodedCode = source_code;
      
      // Only try to decode base64 if it looks like base64
      if (typeof source_code === 'string' && source_code.match(/^[A-Za-z0-9+/]+={0,2}$/) && source_code.length % 4 === 0) {
        try {
          decodedCode = Buffer.from(source_code, 'base64').toString('utf-8');
          console.log('Decoded base64 code for mock execution');
        } catch (e) {
          console.log('Failed to decode base64, using plain text');
          decodedCode = source_code;
        }
      } else {
        console.log('Using plain text code for mock execution');
      }
      
      console.log('Mock execution - Language ID:', language_id);
      console.log('Mock execution - Code preview:', decodedCode.substring(0, 100) + '...');
      console.log('Mock execution - Full code:', decodedCode);
      const result = mockExecution(decodedCode, language_id);
      console.log('Mock execution - Result:', result);
      return res.json(result);
    }

    // Submit code for execution to Judge0 API
    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code: source_code,
        language_id: language_id,
        stdin: stdin,
        wait: true,
        fields: '*'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': RAPIDAPI_KEY
        },
        params: {
          base64_encoded: 'false',
          wait: 'true',
          fields: '*'
        }
      }
    );

    const result = submissionResponse.data;

    // Decode base64 outputs if they exist
    if (result.stdout) {
      result.stdout = Buffer.from(result.stdout, 'base64').toString('utf-8');
    }
    if (result.stderr) {
      result.stderr = Buffer.from(result.stderr, 'base64').toString('utf-8');
    }
    if (result.compile_output) {
      result.compile_output = Buffer.from(result.compile_output, 'base64').toString('utf-8');
    }

    res.json(result);

  } catch (error) {
    console.error('Code execution error:', error);
    
    if (error.response) {
      // Judge0 API error
      return res.status(error.response.status).json({
        message: 'Code execution failed',
        error: error.response.data
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error during code execution' 
    });
  }
};

/**
 * @route   GET /api/code/languages
 * @desc    Get supported programming languages
 * @access  Public
 */
router.get('/languages', async (req, res) => {
  try {
    // Use mock languages if no API key is configured
    if (USE_MOCK) {
      const mockLanguages = [
        { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
        { id: 71, name: 'Python (3.8.1)' },
        { id: 62, name: 'Java (OpenJDK 13.0.1)' },
        { id: 54, name: 'C++ (GCC 9.2.0)' },
        { id: 50, name: 'C (GCC 9.2.0)' },
        { id: 51, name: 'C# (Mono 6.6.0.161)' },
        { id: 60, name: 'Go (1.13.5)' },
        { id: 68, name: 'PHP (7.4.1)' },
        { id: 72, name: 'Ruby (2.7.0)' },
        { id: 73, name: 'Rust (1.40.0)' }
      ];
      return res.json(mockLanguages);
    }

    const response = await axios.get(`${JUDGE0_API_URL}/languages`, {
      headers: {
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': RAPIDAPI_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ 
      message: 'Failed to fetch supported languages' 
    });
  }
});

/**
 * @route   GET /api/code/status/:token
 * @desc    Get execution status by token
 * @access  Private
 */
router.get('/status/:token', auth, async (req, res) => {
  try {
    const { token } = req.params;

    const response = await axios.get(
      `${JUDGE0_API_URL}/submissions/${token}`,
      {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': RAPIDAPI_KEY
        },
        params: {
          base64_encoded: 'false',
          fields: '*'
        }
      }
    );

    const result = response.data;

    // Decode base64 outputs if they exist
    if (result.stdout) {
      result.stdout = Buffer.from(result.stdout, 'base64').toString('utf-8');
    }
    if (result.stderr) {
      result.stderr = Buffer.from(result.stderr, 'base64').toString('utf-8');
    }
    if (result.compile_output) {
      result.compile_output = Buffer.from(result.compile_output, 'base64').toString('utf-8');
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching execution status:', error);
    res.status(500).json({ 
      message: 'Failed to fetch execution status' 
    });
  }
});

/**
 * @route   POST /api/code/batch
 * @desc    Execute multiple code submissions in batch
 * @access  Private
 */
router.post('/batch', auth, async (req, res) => {
  try {
    const { submissions } = req.body;

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({ 
        message: 'Submissions array is required' 
      });
    }

    const batchResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions/batch`,
      {
        submissions: submissions
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': RAPIDAPI_KEY
        },
        params: {
          base64_encoded: 'false'
        }
      }
    );

    res.json(batchResponse.data);
  } catch (error) {
    console.error('Batch execution error:', error);
    res.status(500).json({ 
      message: 'Batch execution failed' 
    });
  }
});

module.exports = router;