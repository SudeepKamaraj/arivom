const express = require('express');
const { auth, logActivity } = require('../middleware/auth');
const Activity = require('../models/Activity');

const router = express.Router();

// Sample video data - in production, this would come from a database
const VIDEO_DATA = {
  'react-lesson-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Introduction to React',
    duration: 596,
    thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  'react-lesson-2': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'React Components',
    duration: 653,
    thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  'node-lesson-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Node.js Basics',
    duration: 612,
    thumbnail: 'https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  'pyds-lesson-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    title: 'Python Data Science Intro',
    duration: 745,
    thumbnail: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200'
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

    // Log video view activity
    req.activityData = {
      type: 'video_watch',
      description: `Started watching video: ${videoData.title}`,
      metadata: { lessonId, videoTitle: videoData.title }
    };

    res.json({
      id: lessonId,
      title: videoData.title,
      duration: videoData.duration,
      thumbnail: videoData.thumbnail,
      url: videoData.url,
      quality: '720p'
    });
  } catch (error) {
    console.error('Video metadata error:', error);
    res.status(500).json({ message: 'Server error fetching video metadata' });
  }
});

// Get video stream URL
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

    res.json({
      url: videoData.url,
      quality: '720p',
      duration: videoData.duration
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
      url: data.url
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

module.exports = router;
