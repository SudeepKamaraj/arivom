const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'public', 'videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, safe);
  }
});

const upload = multer({ storage });

// Helper function to generate video ID from filename
function generateVideoId(filename) {
  return crypto.createHash('md5').update(filename).digest('hex');
}

// POST /api/uploads/video -> returns { videoId, filename } instead of direct URL
router.post('/video', auth, requireRole(['admin','instructor']), upload.single('file'), (req, res) => {
  try {
    const filename = req.file.filename;
    const videoId = generateVideoId(filename);
    
    // Return secure video information instead of direct URL
    res.json({ 
      videoId,
      filename,
      originalName: req.file.originalname,
      size: req.file.size,
      message: 'Video uploaded successfully. Use videoId for secure access.'
    });
  } catch (e) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;


