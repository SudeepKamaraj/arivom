import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  duration?: number;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [achievement, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-2xl shadow-yellow-300/70';
      case 'epic': return 'shadow-xl shadow-purple-300/50';
      case 'rare': return 'shadow-lg shadow-blue-300/40';
      default: return 'shadow-lg';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course': return '📚';
      case 'assessment': return '📝';
      case 'streak': return '🔥';
      case 'community': return '👥';
      case 'special': return '🌟';
      default: return '🏆';
    }
  };

  if (!achievement || !isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4">
      <div
        className={`
          pointer-events-auto relative bg-white rounded-2xl p-8 max-w-md w-full
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8'}
          ${getRarityGlow(achievement.rarity)}
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl"></div>
          <div className="absolute inset-2 bg-white rounded-xl"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl z-10"
        >
          ×
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="text-4xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Achievement Unlocked!</h2>
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
              {achievement.rarity.toUpperCase()}
            </div>
          </div>

          {/* Achievement Details */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-4">
                <img 
                  src={achievement.icon || '/assets/default-achievement.png'} 
                  alt="" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800">{achievement.name}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-lg mr-2">{getCategoryIcon(achievement.category)}</span>
                  <span className="text-sm text-gray-600 capitalize">{achievement.category}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
            
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg inline-block font-medium">
              +{achievement.xpReward} XP Earned!
            </div>
          </div>

          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-ping opacity-70`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Sparkle Effects */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-400 text-xl animate-pulse"
                style={{
                  left: `${10 + (i * 15)}%`,
                  top: `${20 + (i % 2) * 60}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AchievementNotification;
