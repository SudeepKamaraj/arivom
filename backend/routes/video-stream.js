const express = require('express');
const router = express.Router();

// Video streaming route - basic implementation
router.get('/:videoId', (req, res) => {
  res.status(501).json({ 
    message: 'Video streaming not implemented yet',
    videoId: req.params.videoId 
  });
});

module.exports = router;