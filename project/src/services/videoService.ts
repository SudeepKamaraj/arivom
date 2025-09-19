// Video service for handling course videos and streaming

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  thumbnail: string;
  url: string;
  quality: '360p' | '480p' | '720p' | '1080p';
  subtitles?: string;
}

// Removed local video imports; rely on DB or remote URLs instead

// Sample video URLs - in production, these would come from your video hosting service
const VIDEO_URLS = {
  // React Course Videos 
  // These sample entries are kept only for fallback/testing with remote URLs.
  
  // Node.js Course Videos
  'node-lesson-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 612,
    quality: '720p' as const
  },
  'node-lesson-2': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 678,
    quality: '720p' as const
  },
  
  // Python Data Science Videos
  'pyds-lesson-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 745,
    quality: '720p' as const
  },
  'pyds-lesson-2': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 823,
    quality: '720p' as const
  },
  
  // Vue.js Course Videos
  'vue-lesson-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 888,
    quality: '720p' as const
  },
  'vue-lesson-2': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 734,
    quality: '720p' as const
  },
  
  // Angular Course Videos
  'angular-lesson-1': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 567,
    quality: '720p' as const
  },
  'angular-lesson-2': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnail: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=1200',
    duration: 612,
    quality: '720p' as const
  }
};

export class VideoService {
  // Get video metadata for a specific lesson
  static getVideoMetadata(lessonId: string): VideoMetadata | null {
    const videoData = VIDEO_URLS[lessonId as keyof typeof VIDEO_URLS];
    
    if (!videoData) {
      // Return a default video if not found
      return {
        id: lessonId,
        title: 'Sample Video',
        description: 'This is a sample video for demonstration purposes.',
        duration: 600,
        thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '720p'
      };
    }
    
    return {
      id: lessonId,
      title: `Lesson ${lessonId.split('-').pop()}`,
      description: 'Comprehensive lesson with hands-on exercises and real-world applications.',
      duration: videoData.duration,
      thumbnail: videoData.thumbnail,
      url: videoData.url,
      quality: videoData.quality
    };
  }
  
  // Get video URL for streaming
  static getVideoUrl(lessonId: string): string {
    const metadata = this.getVideoMetadata(lessonId);
    return metadata?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }
  
  // Get video thumbnail
  static getVideoThumbnail(lessonId: string): string {
    const metadata = this.getVideoMetadata(lessonId);
    return metadata?.thumbnail || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200';
  }
  
  // Get video duration
  static getVideoDuration(lessonId: string): number {
    const metadata = this.getVideoMetadata(lessonId);
    return metadata?.duration || 600;
  }
  
  // Check if video is available
  static isVideoAvailable(lessonId: string): boolean {
    return lessonId in VIDEO_URLS;
  }
  
  // Get all available video IDs
  static getAvailableVideos(): string[] {
    return Object.keys(VIDEO_URLS);
  }
  
  // Get video quality options (for future implementation)
  static getVideoQualities(lessonId: string): string[] {
    return ['360p', '480p', '720p', '1080p'];
  }
  
  // Get video with specific quality
  static getVideoWithQuality(lessonId: string, quality: string): string {
    const baseUrl = this.getVideoUrl(lessonId);
    // In a real implementation, you would append quality parameters
    return baseUrl;
  }
}

export default VideoService;
