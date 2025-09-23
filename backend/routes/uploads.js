const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// POST /api/uploads/video -> returns { url }
router.post('/video', auth, requireRole(['admin','instructor']), upload.single('file'), (req, res) => {
  try {
    const filename = req.file.filename;
    const url = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`}/static/videos/${filename}`;
    res.json({ url, filename });
  } catch (e) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;


