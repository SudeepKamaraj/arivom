// YouTube video utilities

/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove any whitespace
  url = url.trim();

  // Regular expressions for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate if a string is a valid YouTube video ID
 */
function isValidYouTubeVideoId(videoId) {
  if (!videoId || typeof videoId !== 'string') {
    return false;
  }
  // YouTube video IDs are 11 characters long, alphanumeric with hyphens and underscores
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/**
 * Generate YouTube embed URL from video ID
 */
function generateYouTubeEmbedUrl(videoId, options = {}) {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }

  const baseUrl = 'https://www.youtube.com/embed/';
  const params = new URLSearchParams();

  // Default parameters for better embedding
  params.set('rel', '0'); // Don't show related videos from other channels
  params.set('modestbranding', '1'); // Minimal YouTube branding
  
  // Optional parameters
  if (options.autoplay) params.set('autoplay', '1');
  if (options.start) params.set('start', options.start.toString());
  if (options.end) params.set('end', options.end.toString());
  if (options.loop) params.set('loop', '1');
  if (options.mute) params.set('mute', '1');
  if (options.controls === false) params.set('controls', '0');

  return `${baseUrl}${videoId}?${params.toString()}`;
}

/**
 * Generate YouTube thumbnail URL
 */
function generateYouTubeThumbnail(videoId, quality = 'hqdefault') {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }

  // Available qualities: default, mqdefault, hqdefault, sddefault, maxresdefault
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Check if URL is a YouTube URL
 */
function isYouTubeUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const youtubePatterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)/
  ];

  return youtubePatterns.some(pattern => pattern.test(url));
}

/**
 * Get video type from URL or video data
 */
function getVideoType(urlOrData) {
  if (typeof urlOrData === 'string') {
    return isYouTubeUrl(urlOrData) ? 'youtube' : 'local';
  }
  
  if (urlOrData && typeof urlOrData === 'object') {
    if (urlOrData.youtubeId || urlOrData.type === 'youtube') {
      return 'youtube';
    }
    if (urlOrData.videoId || urlOrData.type === 'local') {
      return 'local';
    }
  }
  
  return 'unknown';
}

/**
 * Process video URL and return standardized video data
 */
function processVideoUrl(url, additionalData = {}) {
  if (!url) {
    throw new Error('Video URL is required');
  }

  const videoType = getVideoType(url);
  
  if (videoType === 'youtube') {
    const youtubeId = extractYouTubeVideoId(url);
    if (!youtubeId) {
      throw new Error('Invalid YouTube URL');
    }

    return {
      type: 'youtube',
      youtubeId,
      embedUrl: generateYouTubeEmbedUrl(youtubeId),
      thumbnail: generateYouTubeThumbnail(youtubeId),
      originalUrl: url,
      isPublic: true,
      requiresAuth: false,
      ...additionalData
    };
  } else {
    // For local videos, you'll need to upload them first
    throw new Error('For local videos, please upload the file first to get a videoId');
  }
}

/**
 * Create video data for local videos
 */
function createLocalVideoData(videoId, additionalData = {}) {
  if (!videoId) {
    throw new Error('Video ID is required for local videos');
  }

  return {
    type: 'local',
    videoId,
    isPublic: false,
    requiresAuth: true,
    requiresSecureAccess: true,
    ...additionalData
  };
}

module.exports = {
  extractYouTubeVideoId,
  isValidYouTubeVideoId,
  generateYouTubeEmbedUrl,
  generateYouTubeThumbnail,
  isYouTubeUrl,
  getVideoType,
  processVideoUrl,
  createLocalVideoData
};