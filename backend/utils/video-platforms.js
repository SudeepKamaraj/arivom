/**
 * Multi-Platform Video Hosting Utilities
 * Supports YouTube, Vimeo, Direct MP4, and more
 */

/**
 * Extract video ID from various video platforms
 */
function extractVideoId(url, platform = 'auto') {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Auto-detect platform if not specified
  if (platform === 'auto') {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
    } else if (url.includes('vimeo.com')) {
      platform = 'vimeo';
    } else if (url.includes('dailymotion.com')) {
      platform = 'dailymotion';
    } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      platform = 'direct';
    }
  }

  switch (platform) {
    case 'youtube':
      return extractYouTubeVideoId(url);
    case 'vimeo':
      return extractVimeoVideoId(url);
    case 'dailymotion':
      return extractDailymotionVideoId(url);
    case 'direct':
      return url; // Direct video file
    default:
      return null;
  }
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoVideoId(url) {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /^\d+$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

/**
 * Extract Dailymotion video ID from URL
 */
function extractDailymotionVideoId(url) {
  const patterns = [
    /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
    /dai\.ly\/([a-zA-Z0-9]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate embed URL for different video platforms
 */
function generateEmbedUrl(videoId, platform, options = {}) {
  const {
    autoplay = false,
    muted = true,
    controls = true,
    width = 560,
    height = 315
  } = options;

  switch (platform) {
    case 'youtube':
      return generateYouTubeEmbedUrl(videoId, options);
    case 'vimeo':
      return generateVimeoEmbedUrl(videoId, options);
    case 'dailymotion':
      return generateDailymotionEmbedUrl(videoId, options);
    case 'direct':
      return videoId; // Direct URL
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Generate YouTube embed URL
 */
function generateYouTubeEmbedUrl(videoId, options = {}) {
  const {
    autoplay = false,
    muted = true,
    controls = true,
    rel = false,
    modestbranding = true
  } = options;

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  if (muted) params.set('mute', '1');
  if (!controls) params.set('controls', '0');
  if (!rel) params.set('rel', '0');
  if (modestbranding) params.set('modestbranding', '1');

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Generate Vimeo embed URL
 */
function generateVimeoEmbedUrl(videoId, options = {}) {
  const {
    autoplay = false,
    muted = true,
    controls = true,
    title = false,
    byline = false,
    portrait = false
  } = options;

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  if (muted) params.set('muted', '1');
  if (!title) params.set('title', '0');
  if (!byline) params.set('byline', '0');
  if (!portrait) params.set('portrait', '0');

  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}

/**
 * Generate Dailymotion embed URL
 */
function generateDailymotionEmbedUrl(videoId, options = {}) {
  const {
    autoplay = false,
    muted = true,
    controls = true
  } = options;

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  if (muted) params.set('mute', '1');

  return `https://www.dailymotion.com/embed/video/${videoId}?${params.toString()}`;
}

/**
 * Generate thumbnail URL for different platforms
 */
function generateThumbnailUrl(videoId, platform, quality = 'medium') {
  switch (platform) {
    case 'youtube':
      const ytQuality = quality === 'high' ? 'maxresdefault' : 'mqdefault';
      return `https://img.youtube.com/vi/${videoId}/${ytQuality}.jpg`;
    case 'vimeo':
      // Note: Vimeo requires API call for thumbnails, this is a placeholder
      return `https://vumbnail.com/${videoId}.jpg`;
    case 'dailymotion':
      return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
    case 'direct':
      return null; // No thumbnail for direct videos
    default:
      return null;
  }
}

/**
 * Detect video platform from URL
 */
function detectPlatform(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  } else if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
    return 'dailymotion';
  } else if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
    return 'direct';
  }

  return 'unknown';
}

/**
 * Process video URL and return standardized video data
 */
function processVideoUrl(url, options = {}) {
  const platform = detectPlatform(url);
  
  if (platform === 'unknown') {
    throw new Error('Unsupported video platform or format');
  }

  const videoId = extractVideoId(url, platform);
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  return {
    platform,
    videoId,
    originalUrl: url,
    embedUrl: generateEmbedUrl(videoId, platform, options),
    thumbnailUrl: generateThumbnailUrl(videoId, platform),
    isDirectVideo: platform === 'direct'
  };
}

module.exports = {
  extractVideoId,
  extractYouTubeVideoId,
  extractVimeoVideoId,
  extractDailymotionVideoId,
  generateEmbedUrl,
  generateYouTubeEmbedUrl,
  generateVimeoEmbedUrl,
  generateDailymotionEmbedUrl,
  generateThumbnailUrl,
  detectPlatform,
  processVideoUrl
};