const express = require('express');
const { auth, logActivity } = require('../middleware/auth');
const Activity = require('../models/Activity');
const Course = require('../models/Course');
const crypto = require('crypto');
const { 
  processVideoUrl, 
  createLocalVideoData, 
  getVideoType,
  extractYouTubeVideoId,
  generateYouTubeEmbedUrl,
  generateYouTubeThumbnail 
} = require('../utils/youtube');
const videoPlatforms = require('../utils/video-platforms');

const router = express.Router();

// Helper function to generate video ID from filename
function generateVideoId(filename) {
  return crypto.createHash('md5').update(filename).digest('hex');
}

// Sample video data with mixed YouTube and local videos
const VIDEO_DATA = {
  // YouTube videos (free access)
  'react-lesson-1': {
    type: 'youtube',
    youtubeId: 'Ke90Tje7VS0', // React tutorial
    title: 'Introduction to React',
    duration: 596,
    courseId: 'react-course',
    isPublic: true,
    requiresAuth: false
  },
  'react-lesson-2': {
    type: 'youtube',
    youtubeId: 'SqcY0GlETPk', // React components tutorial
    title: 'React Components Basics',
    duration: 653,
    courseId: 'react-course',
    isPublic: true,
    requiresAuth: false
  },
  
  // Local videos (premium access)
  'react-lesson-3': {
    type: 'local',
    videoId: generateVideoId('react-advanced.mp4'),
    title: 'Advanced React Patterns (Premium)',
    duration: 720,
    thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200',
    courseId: 'react-course',
    isPublic: false,
    requiresAuth: true,
    requiresSecureAccess: true
  },
  
  // Mixed course example
  'node-lesson-1': {
    type: 'youtube',
    youtubeId: 'TlB_eWDSMt4', // Node.js tutorial
    title: 'Node.js Basics (Free)',
    duration: 612,
    courseId: 'node-course',
    isPublic: true,
    requiresAuth: false
  },
  'node-lesson-2': {
    type: 'local',
    videoId: generateVideoId('node-advanced.mp4'),
    title: 'Advanced Node.js (Premium)',
    duration: 845,
    thumbnail: 'https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1200',
    courseId: 'node-course',
    isPublic: false,
    requiresAuth: true,
    requiresSecureAccess: true
  }
};


// Get video metadata
router.get('/metadata/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const videoData = VIDEO_DATA[lessonId];
    
    if (!videoData) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Log video view activity (only if user is authenticated)
    if (req.user) {
      req.activityData = {
        type: 'video_watch',
        description: `Started watching video: ${videoData.title}`,
        metadata: { lessonId, videoTitle: videoData.title, videoType: videoData.type }
      };
    }

    const baseResponse = {
      id: lessonId,
      title: videoData.title,
      duration: videoData.duration,
      courseId: videoData.courseId,
      type: videoData.type,
      isPublic: videoData.isPublic,
      requiresAuth: videoData.requiresAuth
    };

    if (videoData.type === 'youtube') {
      // YouTube videos - return embed URL directly and generate thumbnail
      const thumbnail = videoData.thumbnail || generateYouTubeThumbnail(videoData.youtubeId);
      res.json({
        ...baseResponse,
        youtubeId: videoData.youtubeId,
        embedUrl: generateYouTubeEmbedUrl(videoData.youtubeId),
        thumbnail: thumbnail,
        accessType: 'public',
        message: 'YouTube video - publicly accessible'
      });
    } else {
      // Local videos - require secure access
      res.json({
        ...baseResponse,
        videoId: videoData.videoId,
        thumbnail: videoData.thumbnail,
        requiresSecureAccess: videoData.requiresSecureAccess,
        accessType: 'premium',
        message: 'Premium video - requires course enrollment'
      });
    }
  } catch (error) {
    console.error('Video metadata error:', error);
    res.status(500).json({ message: 'Server error fetching video metadata' });
  }
});

// Get public video metadata (no authentication required for YouTube videos)
router.get('/public/metadata/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const videoData = VIDEO_DATA[lessonId];
    
    if (!videoData) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Only allow public access to YouTube videos
    if (videoData.type !== 'youtube' || !videoData.isPublic) {
      return res.status(403).json({ 
        message: 'This video requires authentication. Please login to access premium content.',
        type: videoData.type,
        requiresAuth: true
      });
    }

    const thumbnail = videoData.thumbnail || generateYouTubeThumbnail(videoData.youtubeId);
    
    res.json({
      id: lessonId,
      title: videoData.title,
      duration: videoData.duration,
      courseId: videoData.courseId,
      type: videoData.type,
      youtubeId: videoData.youtubeId,
      embedUrl: generateYouTubeEmbedUrl(videoData.youtubeId),
      thumbnail: thumbnail,
      isPublic: true,
      accessType: 'public',
      message: 'YouTube video - publicly accessible'
    });
  } catch (error) {
    console.error('Public video metadata error:', error);
    res.status(500).json({ message: 'Server error fetching video metadata' });
  }
});

// Get video stream URL - now redirects to secure video streaming
router.get('/stream/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const videoData = VIDEO_DATA[lessonId];
    
    if (!videoData) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Log video access activity
    req.activityData = {
      type: 'video_watch',
      description: `Accessed video stream: ${videoData.title}`,
      metadata: { lessonId, videoTitle: videoData.title, action: 'stream_access' }
    };

    // Instead of direct URL, provide information for secure access
    res.json({
      videoId: videoData.videoId,
      courseId: videoData.courseId,
      quality: '720p',
      duration: videoData.duration,
      message: 'Use /api/video-stream/secure-url to get streaming URL',
      secureAccessRequired: true
    });
  } catch (error) {
    console.error('Video stream error:', error);
    res.status(500).json({ message: 'Server error fetching video stream' });
  }
});

// Get all available videos
router.get('/list', auth, async (req, res) => {
  try {
    const videos = Object.entries(VIDEO_DATA).map(([id, data]) => ({
      id,
      title: data.title,
      duration: data.duration,
      thumbnail: data.thumbnail,
      videoId: data.videoId,
      courseId: data.courseId,
      // No direct URLs
      requiresSecureAccess: true
    }));

    res.json(videos);
  } catch (error) {
    console.error('Video list error:', error);
    res.status(500).json({ message: 'Server error fetching video list' });
  }
});

// Update video progress
router.post('/progress', auth, logActivity, async (req, res) => {
  try {
    const { lessonId, progress, duration } = req.body;
    
    // Log progress update activity
    req.activityData = {
      type: 'video_watch',
      description: `Updated video progress: ${Math.round(progress)}%`,
      metadata: { lessonId, progress, duration }
    };

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Video progress error:', error);
    res.status(500).json({ message: 'Server error updating video progress' });
  }
});

// Complete video
router.post('/complete', auth, logActivity, async (req, res) => {
  try {
    const { lessonId, courseId } = req.body;
    
    // Log video completion activity
    req.activityData = {
      type: 'video_watch',
      description: `Completed video lesson`,
      metadata: { lessonId, courseId, action: 'completed' }
    };

    res.json({ message: 'Video completed successfully' });
  } catch (error) {
    console.error('Video completion error:', error);
    res.status(500).json({ message: 'Server error completing video' });
  }
});

// Add YouTube video (Admin/Instructor only)
router.post('/add-youtube', auth, async (req, res) => {
  try {
    const { youtubeUrl, title, courseId, lessonId, duration } = req.body;

    // Check if user has permission (in a real app, check role)
    if (!req.user || !['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin or instructor access required' });
    }

    if (!youtubeUrl || !title || !courseId || !lessonId) {
      return res.status(400).json({ 
        message: 'YouTube URL, title, courseId, and lessonId are required' 
      });
    }

    try {
      // Process YouTube URL
      const videoData = processVideoUrl(youtubeUrl, {
        title,
        courseId,
        duration: duration || 0
      });

      // Add to VIDEO_DATA (in production, save to database)
      VIDEO_DATA[lessonId] = {
        type: 'youtube',
        youtubeId: videoData.youtubeId,
        title,
        duration: duration || 0,
        thumbnail: videoData.thumbnail,
        courseId,
        isPublic: true,
        requiresAuth: false
      };

      res.json({
        message: 'YouTube video added successfully',
        lessonId,
        videoData: {
          type: 'youtube',
          youtubeId: videoData.youtubeId,
          embedUrl: videoData.embedUrl,
          thumbnail: videoData.thumbnail,
          title,
          courseId
        }
      });

    } catch (videoError) {
      return res.status(400).json({ message: videoError.message });
    }

  } catch (error) {
    console.error('Add YouTube video error:', error);
    res.status(500).json({ message: 'Server error adding YouTube video' });
  }
});

// Get video by type
router.get('/by-type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['youtube', 'local'].includes(type)) {
      return res.status(400).json({ message: 'Invalid video type. Use "youtube" or "local"' });
    }

    const videos = Object.entries(VIDEO_DATA)
      .filter(([id, data]) => data.type === type)
      .map(([id, data]) => ({
        id,
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        courseId: data.courseId,
        type: data.type,
        isPublic: data.isPublic,
        ...(data.type === 'youtube' ? { youtubeId: data.youtubeId } : { videoId: data.videoId })
      }));

    res.json({
      type,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Get videos by type error:', error);
    res.status(500).json({ message: 'Server error fetching videos by type' });
  }
});

/**
 * Process any video URL (YouTube, Vimeo, Dailymotion, or direct)
 * POST /api/videos/process-url
 */
router.post('/process-url', async (req, res) => {
  try {
    const { url, title, description, courseId, lessonId, duration } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'Video URL is required' });
    }

    // Process the video URL
    const videoData = videoPlatforms.processVideoUrl(url);
    
    // Add additional metadata
    const processedVideo = {
      ...videoData,
      title: title || `Video from ${videoData.platform}`,
      description: description || '',
      courseId: courseId || '',
      lessonId: lessonId || '',
      duration: duration ? parseInt(duration) : null,
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: `${videoData.platform} video processed successfully`,
      video: processedVideo
    });

  } catch (error) {
    console.error('Process video URL error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process video URL'
    });
  }
});

/**
 * Add video from various platforms to course
 * POST /api/videos/add-video
 */
router.post('/add-video', auth, async (req, res) => {
  try {
    const { url, title, description, courseId, lessonId, duration, isPublic = true } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'Video URL is required' });
    }

    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson ID is required' });
    }

    // Process the video URL
    const videoData = videoPlatforms.processVideoUrl(url);
    
    // Create video entry for VIDEO_DATA
    const newVideo = {
      type: videoData.platform,
      videoId: videoData.videoId,
      originalUrl: url,
      embedUrl: videoData.embedUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      title: title || `Video from ${videoData.platform}`,
      description: description || '',
      courseId: courseId || '',
      duration: duration ? parseInt(duration) : null,
      isPublic: isPublic,
      requiresAuth: !isPublic,
      createdAt: new Date(),
      createdBy: req.user.id
    };

    // Here you would add to your VIDEO_DATA or save to database
    // For demonstration, we'll just return the video data
    
    res.json({
      success: true,
      message: `${videoData.platform} video added successfully`,
      lessonId: lessonId,
      video: newVideo
    });

  } catch (error) {
    console.error('Add video error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add video'
    });
  }
});

/**
 * Get supported video platforms
 * GET /api/videos/supported-platforms
 */
router.get('/supported-platforms', (req, res) => {
  res.json({
    platforms: [
      {
        name: 'YouTube',
        id: 'youtube',
        description: 'YouTube videos and playlists',
        example: 'https://www.youtube.com/watch?v=VIDEO_ID',
        features: ['Embed', 'Thumbnails', 'Public Access']
      },
      {
        name: 'Vimeo',
        id: 'vimeo',
        description: 'Vimeo videos',
        example: 'https://vimeo.com/VIDEO_ID',
        features: ['Embed', 'Thumbnails', 'High Quality']
      },
      {
        name: 'Dailymotion',
        id: 'dailymotion',
        description: 'Dailymotion videos',
        example: 'https://www.dailymotion.com/video/VIDEO_ID',
        features: ['Embed', 'Thumbnails']
      },
      {
        name: 'Direct Video',
        id: 'direct',
        description: 'Direct video file links (MP4, WebM, etc.)',
        example: 'https://example.com/video.mp4',
        features: ['Direct Streaming', 'Custom Player']
      },
      {
        name: 'File Upload',
        id: 'upload',
        description: 'Upload video files directly',
        example: 'Use /api/upload/video endpoint',
        features: ['Private Hosting', 'Full Control', 'No External Dependencies']
      }
    ]
  });
});

module.exports = router;
