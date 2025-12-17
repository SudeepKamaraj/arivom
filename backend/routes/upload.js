const express = require('express');
const router = express.Router();

// File upload route - basic implementation
router.post('/', (req, res) => {
  res.status(501).json({ 
    message: 'File upload not implemented yet'
  });
});

router.get('/', (req, res) => {
  res.status(501).json({ 
    message: 'File listing not implemented yet'
  });
});

module.exports = router;