// Example usage of secure video streaming in React component

import React, { useState, useEffect } from 'react';
import { api } from '../config/api';

interface SecureVideoPlayerProps {
  lessonId: string;
  courseId: string;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({ lessonId, courseId }) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [videoMetadata, setVideoMetadata] = useState<any>(null);

  useEffect(() => {
    loadVideo();
  }, [lessonId, courseId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Get video metadata
      const metadataResponse = await api.get(`/videos/metadata/${lessonId}`);
      const metadata = metadataResponse.data;
      setVideoMetadata(metadata);

      // Step 2: Request secure video URL
      const secureUrlResponse = await api.post('/video-stream/secure-url', {
        videoId: metadata.videoId,
        courseId: metadata.courseId
      });

      const { url } = secureUrlResponse.data;
      
      // Step 3: Construct full URL for video player
      const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${url}`;
      setVideoUrl(fullUrl);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={loadVideo}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {videoMetadata && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold">{videoMetadata.title}</h3>
          <p className="text-gray-600">Duration: {Math.floor(videoMetadata.duration / 60)}:{(videoMetadata.duration % 60).toString().padStart(2, '0')}</p>
        </div>
      )}
      
      <video
        key={videoUrl} // Force re-render when URL changes
        controls
        className="w-full h-auto"
        poster={videoMetadata?.thumbnail}
        onLoadStart={() => console.log('Video load started')}
        onError={(e) => {
          console.error('Video error:', e);
          setError('Failed to play video');
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Video expires notification */}
      <p className="text-sm text-gray-500 mt-2">
        Video access expires in 1 hour. Refresh if needed.
      </p>
    </div>
  );
};

export default SecureVideoPlayer;