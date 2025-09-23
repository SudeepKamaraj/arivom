const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for video file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/videos');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${timestamp}-${originalName}`);
  }
});

// File filter to accept only video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  }
});

/**
 * Upload a single video file
 * POST /api/upload/video
 */
router.post('/video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No video file uploaded' 
      });
    }

    const { title, description, courseId, lessonId, duration } = req.body;

    const videoData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/uploads/videos/${req.file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`,
      title: title || req.file.originalname,
      description: description || '',
      courseId: courseId || '',
      lessonId: lessonId || '',
      duration: duration ? parseInt(duration) : null,
      uploadedAt: new Date(),
      type: 'direct'
    };

    // Here you would typically save to database
    // For now, return the video data
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: videoData
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Video upload failed',
      error: error.message
    });
  }
});

/**
 * Upload multiple video files
 * POST /api/upload/videos
 */
router.post('/videos', upload.array('videos', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No video files uploaded' 
      });
    }

    const uploadedVideos = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: `/uploads/videos/${file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/videos/${file.filename}`,
      uploadedAt: new Date(),
      type: 'direct'
    }));

    res.json({
      success: true,
      message: `${uploadedVideos.length} videos uploaded successfully`,
      videos: uploadedVideos
    });

  } catch (error) {
    console.error('Multiple video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Video upload failed',
      error: error.message
    });
  }
});

/**
 * Delete uploaded video
 * DELETE /api/upload/video/:filename
 */
router.delete('/video/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../public/uploads/videos', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

  } catch (error) {
    console.error('Video deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Video deletion failed',
      error: error.message
    });
  }
});

/**
 * Get list of uploaded videos
 * GET /api/upload/videos/list
 */
router.get('/videos/list', (req, res) => {
  try {
    const videosDir = path.join(__dirname, '../public/uploads/videos');
    
    if (!fs.existsSync(videosDir)) {
      return res.json({
        success: true,
        videos: []
      });
    }

    const files = fs.readdirSync(videosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv'].includes(ext);
    });

    const videos = videoFiles.map(filename => {
      const filePath = path.join(videosDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        url: `${req.protocol}://${req.get('host')}/uploads/videos/${filename}`,
        path: `/uploads/videos/${filename}`,
        uploadedAt: stats.birthtime,
        type: 'direct'
      };
    });

    res.json({
      success: true,
      videos: videos.sort((a, b) => b.uploadedAt - a.uploadedAt)
    });

  } catch (error) {
    console.error('Video list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video list',
      error: error.message
    });
  }
});

module.exports = router;