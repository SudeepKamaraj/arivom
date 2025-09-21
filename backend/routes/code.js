const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');

// Judge0 API configuration - You need to get API key from RapidAPI
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'your-rapidapi-key-here';

/**
 * @route   POST /api/code/execute
 * @desc    Execute code using Judge0 API
 * @access  Private
 */
router.post('/execute', auth, async (req, res) => {
  try {
    const { source_code, language_id, stdin = '' } = req.body;

    if (!source_code || !language_id) {
      return res.status(400).json({ 
        message: 'Source code and language ID are required' 
      });
    }

    // Submit code for execution
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
});

/**
 * @route   GET /api/code/languages
 * @desc    Get supported programming languages
 * @access  Public
 */
router.get('/languages', async (req, res) => {
  try {
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