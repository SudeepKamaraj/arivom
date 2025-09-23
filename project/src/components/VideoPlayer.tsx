import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { ArrowLeft, Play, Pause, Volume2, Maximize2, Check, Settings, Sparkles } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

interface VideoPlayerProps {
  lesson: any;
  course: any;
  onComplete: () => void;
  onBack: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  course,
  onComplete,
  onBack
}) => {
  const { user } = useAuth();
  // Function to mark video as completed on backend
  const markVideoCompleteOnBackend = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !course?._id || !lesson?.id) return;

      const response = await fetch(getApiUrl(`courses/${course._id}/progress/video`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId: lesson.id,
          watchedTime: duration,
          isCompleted: true
        })
      });

      if (response.ok) {
        console.log('Video completion synced with backend');
        
        // Check for achievements after video completion
        try {
          await fetch(getApiUrl('achievements/check'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              actionType: 'WATCH_VIDEO',
              courseId: course._id
            })
          });
        } catch (achievementError) {
          console.error('Error checking achievements:', achievementError);
        }
      } else {
        console.error('Failed to sync video completion with backend');
      }
    } catch (error) {
      console.error('Error syncing video completion:', error);
    }
  };

  const { updateLessonProgress, setLastLessonId } = useCourses();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [watchedTime, setWatchedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('720p');
  const [showSettings, setShowSettings] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get correct IDs
  const courseId = course._id || course.id;
  const lessonId = lesson._id || lesson.id;
  const userId = user?.id;

  // Build URL preference: DB lesson URL -> custom override -> course preview
  const customUrl = (typeof window !== 'undefined') ? localStorage.getItem(`custom_video_url_${lessonId}`) : null;
  const videoUrl = lesson?.url || customUrl || course.previewVideoUrl;

  const watchKey = `watch_${userId}_${lessonId}`;
  
  useEffect(() => {
    const savedWatchedTime = localStorage.getItem(watchKey);
    if (savedWatchedTime) {
      setWatchedTime(parseInt(savedWatchedTime));
    }
  }, [watchKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Track watched time
      const newWatchedTime = Math.max(watchedTime, video.currentTime);
      setWatchedTime(newWatchedTime);
      localStorage.setItem(watchKey, newWatchedTime.toString());
      // Persist last lesson position for resume
      setLastLessonId(courseId, userId || '', lessonId);
      
      // Check if video is completed (watched 95% or more - more lenient)
      // Some videos might have credits or blank endings, so 95% is a good threshold
      if (duration > 0 && newWatchedTime >= (duration * 0.95) && !isCompleted) {
        console.log(`Video ${lessonId} marked as completed at ${newWatchedTime}/${duration} seconds`);
        setIsCompleted(true);
        setShowCompletion(true);
        updateLessonProgress(courseId, lessonId, userId || '');
        
        // Sync completion with backend
        markVideoCompleteOnBackend();
        
        // Hide completion message after 3 seconds
        setTimeout(() => setShowCompletion(false), 3000);
        
        // Force onComplete callback after a short delay to ensure state is updated
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!isCompleted) {
        console.log(`Video ${lessonId} ended - marking as completed`);
        setIsCompleted(true);
        setShowCompletion(true);
        updateLessonProgress(courseId, lessonId, userId || '');
        
        // Sync completion with backend
        markVideoCompleteOnBackend();
        
        setTimeout(() => setShowCompletion(false), 3000);
        
        // Always trigger onComplete when video ends
        // This ensures we navigate back to course detail
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [watchedTime, duration, isCompleted, courseId, lessonId, userId, updateLessonProgress, watchKey, setLastLessonId]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    
    // Prevent seeking in fullscreen mode
    if (isFullscreen) {
      return;
    }
    
    // Prevent seeking beyond watched time (unless completed)
    if (!isCompleted && newTime > watchedTime + 5) {
      return;
    }
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const watchedPercent = duration > 0 ? (watchedTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <button
          onClick={onBack}
          className="group flex items-center space-x-3 text-white/80 hover:text-white mb-8 transition-all duration-300 hover:scale-105"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-full p-2 group-hover:bg-white/20 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back to Course</span>
        </button>

        {/* Enhanced Video Player Container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Video Player */}
          <div 
            className="relative bg-black"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              className="w-full aspect-video"
              poster={lesson?.thumbnail}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Buffering Indicator */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">Buffering...</p>
                </div>
              </div>
            )}
            
            {/* Completion Celebration */}
            {showCompletion && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 backdrop-blur-xl border border-white/20">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Lesson Completed! 🎉</h3>
                  <p className="text-white/90">Great job! You've successfully completed this lesson.</p>
                </div>
              </div>
            )}
            
            {/* Click to play overlay */}
            {!isPlaying && !isBuffering && (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlayPause}
              >
                <div className="bg-white/20 backdrop-blur-md rounded-full p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110">
                  <Play className="w-16 h-16 text-white" />
                </div>
              </div>
            )}
            
            {/* Enhanced Custom Controls */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Enhanced Progress Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={isFullscreen}
                    className={`w-full h-3 bg-white/20 rounded-full appearance-none slider ${
                      isFullscreen ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`
                    }}
                    title={isFullscreen ? 'Seeking disabled in fullscreen mode' : 'Seek through video'}
                  />
                  <div
                    className="absolute top-0 left-0 h-3 bg-white/40 rounded-full pointer-events-none"
                    style={{ width: `${watchedPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-white/80 text-sm mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Enhanced Controls (no prev/next) */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayPause}
                    className="p-4 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 border border-white/30"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                    <Volume2 className="w-4 h-4" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {isCompleted && (
                    <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/30">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Completed</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.requestFullscreen();
                      }
                    }}
                    className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Settings Panel */}
          {showSettings && (
            <div className="bg-white/10 backdrop-blur-xl p-6 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Quality Settings</span>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="360p">360p</option>
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
            </div>
          )}

          {/* Enhanced Lesson Info */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h1 className="text-3xl font-bold text-white">
                    {lesson.title}
                  </h1>
                  {isCompleted && (
                    <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-green-500/30">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Completed</span>
                    </div>
                  )}
                </div>
                <p className="text-white/80 text-lg leading-relaxed max-w-3xl">
                  {lesson.description}
                </p>
              </div>
              
              {isCompleted && (
                <button
                  onClick={onComplete}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-3 hover:scale-105 shadow-lg"
                >
                  <Check className="w-5 h-5" />
                  <span>Continue Learning</span>
                </button>
              )}
            </div>
            
            {/* Enhanced Progress Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-white text-lg">Learning Progress</span>
                <span className="text-2xl font-bold text-white">
                  {Math.round(watchedPercent)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${watchedPercent}%` }}
                />
              </div>
              <p className="text-white/80 mt-3 text-sm">
                {watchedPercent < 95 
                  ? 'Continue watching to unlock the next lesson and earn your completion certificate'
                  : '🎉 Congratulations! You\'ve completed this lesson. Ready for the next challenge?'
                }
              </p>
            </div>
            
            {/* Enhanced Video Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-white/60 text-sm font-medium mb-1">Duration</div>
                <div className="text-white font-semibold">{formatTime(duration)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-white/60 text-sm font-medium mb-1">Quality</div>
                <div className="text-white font-semibold">{quality}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-white/60 text-sm font-medium mb-1">Course</div>
                <div className="text-white font-semibold">{course.title}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-white/60 text-sm font-medium mb-1">Instructor</div>
                <div className="text-white font-semibold">{course.instructor}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;


