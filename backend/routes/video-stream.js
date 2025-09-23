const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const { checkVideoAccessById } = require('../middleware/courseAccess');

const router = express.Router();

// Store video mapping securely (in production, this should be in database)
const VIDEO_MAPPING = new Map();

// Generate secure video token
function generateVideoToken(videoId, userId, expiresIn = 3600) {
  const payload = {
    videoId,
    userId,
    exp: Date.now() + (expiresIn * 1000), // expires in seconds
    iat: Date.now()
  };
  
  const secret = process.env.VIDEO_SECRET || 'fallback-secret-change-in-production';
  const token = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return `${Buffer.from(JSON.stringify(payload)).toString('base64')}.${token}`;
}

// Verify video token
function verifyVideoToken(token) {
  try {
    const [payloadBase64, signature] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    // Check expiration
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Verify signature
    const secret = process.env.VIDEO_SECRET || 'fallback-secret-change-in-production';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
      
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Malformed token' };
  }
}

// Initialize video mappings (in production, load from database)
function initializeVideoMappings() {
  const videosDir = path.join(__dirname, '..', 'public', 'videos');
  
  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir);
    files.forEach(file => {
      if (file.endsWith('.mp4')) {
        const videoId = crypto.createHash('md5').update(file).digest('hex');
        VIDEO_MAPPING.set(videoId, {
          filename: file,
          path: path.join(videosDir, file),
          originalName: file
        });
      }
    });
  }
  
  console.log(`Initialized ${VIDEO_MAPPING.size} video mappings`);
}

// Initialize on startup
initializeVideoMappings();

// Get secure video URL
router.post('/secure-url', auth, async (req, res) => {
  try {
    const { videoId, courseId } = req.body;
    const userId = req.user.id;
    
    // Check if video exists
    if (!VIDEO_MAPPING.has(videoId)) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check course access (if courseId provided)
    if (courseId) {
      const accessCheck = await checkVideoAccessById(userId, videoId, courseId);
      if (!accessCheck.hasAccess) {
        return res.status(403).json({ 
          message: 'Access denied',
          error: accessCheck.error 
        });
      }
    }
    
    // Generate secure token (expires in 1 hour)
    const token = generateVideoToken(videoId, userId, 3600);
    
    // Return secure streaming URL
    const secureUrl = `/api/video-stream/stream/${token}`;
    
    res.json({
      url: secureUrl,
      expiresIn: 3600,
      message: 'Secure video URL generated'
    });
    
  } catch (error) {
    console.error('Secure URL generation error:', error);
    res.status(500).json({ message: 'Failed to generate secure URL' });
  }
});

// Stream video with token authentication
router.get('/stream/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const range = req.headers.range;
    
    // Verify token
    const tokenResult = verifyVideoToken(token);
    if (!tokenResult.valid) {
      return res.status(401).json({ message: tokenResult.error });
    }
    
    const { videoId } = tokenResult.payload;
    
    // Get video info
    const videoInfo = VIDEO_MAPPING.get(videoId);
    if (!videoInfo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const videoPath = videoInfo.path;
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }
    
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    
    if (range) {
      // Handle range requests for video seeking
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const file = fs.createReadStream(videoPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      file.pipe(res);
    } else {
      // Stream entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
    
  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({ message: 'Video streaming failed' });
  }
});

// Get video metadata without exposing file paths
router.get('/metadata/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const videoInfo = VIDEO_MAPPING.get(videoId);
    if (!videoInfo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const videoPath = videoInfo.path;
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }
    
    const stat = fs.statSync(videoPath);
    
    res.json({
      id: videoId,
      size: stat.size,
      originalName: videoInfo.originalName,
      created: stat.birthtime,
      modified: stat.mtime,
      // No file path exposed
    });
    
  } catch (error) {
    console.error('Video metadata error:', error);
    res.status(500).json({ message: 'Failed to get video metadata' });
  }
});

// List available videos (admin only)
router.get('/list', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const videos = Array.from(VIDEO_MAPPING.entries()).map(([id, info]) => ({
      id,
      originalName: info.originalName,
      // No file paths exposed
    }));
    
    res.json(videos);
    
  } catch (error) {
    console.error('Video list error:', error);
    res.status(500).json({ message: 'Failed to list videos' });
  }
});

// Upload video and get secure ID
router.post('/upload', auth, async (req, res) => {
  try {
    // This would integrate with your existing upload logic
    // but return a secure video ID instead of direct URL
    
    res.status(501).json({ message: 'Upload endpoint to be implemented' });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;