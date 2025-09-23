// Universal Video Player Component - handles both YouTube and local videos

import React, { useState, useEffect } from 'react';
import { api } from '../config/api';

interface VideoPlayerProps {
  lessonId: string;
  courseId?: string;
  className?: string;
}

interface VideoMetadata {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  courseId: string;
  type: 'youtube' | 'local';
  isPublic: boolean;
  requiresAuth: boolean;
  youtubeId?: string;
  embedUrl?: string;
  videoId?: string;
  requiresSecureAccess?: boolean;
  accessType: 'public' | 'premium';
  message: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lessonId, courseId, className = '' }) => {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [secureVideoUrl, setSecureVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadVideo();
  }, [lessonId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Get video metadata
      const metadataResponse = await api.get(`/videos/metadata/${lessonId}`);
      const videoMetadata = metadataResponse.data;
      setMetadata(videoMetadata);

      // Step 2: Handle based on video type
      if (videoMetadata.type === 'youtube') {
        // YouTube videos are ready to use
        console.log('YouTube video loaded:', videoMetadata.youtubeId);
      } else if (videoMetadata.type === 'local') {
        // Local videos need secure URL
        await loadSecureVideoUrl(videoMetadata);
      }

    } catch (err: any) {
      console.error('Video loading error:', err);
      if (err.response?.status === 403) {
        setError('You need to enroll in this course to access this video');
      } else if (err.response?.status === 404) {
        setError('Video not found');
      } else {
        setError('Failed to load video');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSecureVideoUrl = async (videoMetadata: VideoMetadata) => {
    try {
      const secureUrlResponse = await api.post('/video-stream/secure-url', {
        videoId: videoMetadata.videoId,
        courseId: videoMetadata.courseId
      });

      const { url } = secureUrlResponse.data;
      const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${url}`;
      setSecureVideoUrl(fullUrl);

    } catch (err: any) {
      console.error('Secure URL error:', err);
      if (err.response?.status === 403) {
        setError('Premium content - course enrollment required');
      } else {
        setError('Failed to get video access');
      }
    }
  };

  const renderVideoPlayer = () => {
    if (!metadata) return null;

    if (metadata.type === 'youtube') {
      return (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={metadata.embedUrl}
            title={metadata.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    } else if (metadata.type === 'local' && secureVideoUrl) {
      return (
        <video
          className="w-full h-auto rounded-lg"
          controls
          poster={metadata.thumbnail}
          onError={() => setError('Failed to play video')}
        >
          <source src={secureVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Loading video...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg ${className}`}>
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Video Error</p>
            <p>{error}</p>
          </div>
        </div>
        <button 
          onClick={loadVideo}
          className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Video Info Header */}
      {metadata && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">{metadata.title}</h3>
            <div className="flex items-center space-x-2">
              {metadata.type === 'youtube' ? (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Free
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Premium
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <span>Duration: {Math.floor(metadata.duration / 60)}:{(metadata.duration % 60).toString().padStart(2, '0')}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{metadata.accessType} Content</span>
          </div>
        </div>
      )}

      {/* Video Player */}
      {renderVideoPlayer()}

      {/* Additional Info */}
      {metadata && (
        <div className="mt-4 text-sm text-gray-500">
          {metadata.type === 'youtube' ? (
            <p>✅ This video is freely accessible to everyone</p>
          ) : (
            <p>🔒 Premium content - Access expires in 1 hour</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;