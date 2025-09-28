import React from 'react';

interface ProgressMilestone {
  date: string;
  progress: number;
  milestone: string;
}

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  progress?: number;
  progressHistory?: ProgressMilestone[];
  estimatedTime?: string;
  difficulty?: number;
}

interface AchievementProgressTrackerProps {
  achievement: Achievement;
  className?: string;
}

const AchievementProgressTracker: React.FC<AchievementProgressTrackerProps> = ({
  achievement,
  className = ''
}) => {
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

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-green-400 to-green-600';
    if (progress >= 50) return 'from-yellow-400 to-yellow-600';
    if (progress >= 25) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
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

  const getDifficultyStars = (difficulty?: number) => {
    if (!difficulty) return '';
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const progress = achievement.progress || 0;
  const milestones = [
    { threshold: 25, label: 'Getting Started', icon: '🚀' },
    { threshold: 50, label: 'Halfway There', icon: '⚡' },
    { threshold: 75, label: 'Almost Done', icon: '🎯' },
    { threshold: 100, label: 'Completed!', icon: '🏆' }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-4">
            <img 
              src={achievement.icon || '/assets/default-achievement.png'} 
              alt="" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{achievement.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600">
                {getCategoryIcon(achievement.category)} {achievement.category}
              </span>
              {achievement.difficulty && (
                <span className="text-yellow-400 text-sm">
                  {getDifficultyStars(achievement.difficulty)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`
            inline-block px-3 py-1 rounded-full text-xs font-bold text-white
            bg-gradient-to-r ${getRarityColor(achievement.rarity)}
          `}>
            {achievement.rarity.toUpperCase()}
          </span>
          {achievement.estimatedTime && (
            <p className="text-xs text-gray-500 mt-1">~{achievement.estimatedTime}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6">{achievement.description}</p>

      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-800">Progress</span>
          <span className="text-2xl font-bold text-gray-800">{Math.round(progress)}%</span>
        </div>
        
        <div className="relative">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div 
              className={`
                h-6 rounded-full transition-all duration-1000 ease-out
                bg-gradient-to-r ${getProgressColor(progress)}
                flex items-center justify-end pr-2
              `}
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-white text-xs font-bold">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
          
          {/* Milestone Markers */}
          <div className="absolute top-0 left-0 w-full h-6 flex items-center">
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="absolute w-1 h-full bg-white opacity-50"
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Milestones</h4>
        <div className="space-y-2">
          {milestones.map((milestone) => {
            const isReached = progress >= milestone.threshold;
            const isCurrent = progress < milestone.threshold && 
              progress >= (milestones.find(m => m.threshold < milestone.threshold)?.threshold || 0);
            
            return (
              <div
                key={milestone.threshold}
                className={`
                  flex items-center p-3 rounded-lg transition-all duration-300
                  ${isReached 
                    ? 'bg-green-50 border-l-4 border-green-500' 
                    : isCurrent
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50 border-l-4 border-gray-300'
                  }
                `}
              >
                <span className={`text-2xl mr-3 ${isReached ? '' : 'opacity-50'}`}>
                  {milestone.icon}
                </span>
                <div className="flex-1">
                  <span className={`font-medium ${
                    isReached ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {milestone.label}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({milestone.threshold}%)
                  </span>
                </div>
                {isReached && (
                  <span className="text-green-600 text-lg">✓</span>
                )}
                {isCurrent && (
                  <span className="text-blue-600 text-lg animate-pulse">⏳</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress History */}
      {achievement.progressHistory && achievement.progressHistory.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Recent Activity</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {achievement.progressHistory
              .slice(-5)
              .reverse()
              .map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{entry.milestone}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {entry.progress}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Reward Information */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Reward</span>
            <div className="flex items-center mt-1">
              <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                +{achievement.xpReward} XP
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-sm text-gray-600">Remaining</span>
            <div className="text-lg font-bold text-gray-800 mt-1">
              {Math.round((100 - progress) / 100 * achievement.xpReward)} XP
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex space-x-3">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Continue Progress
        </button>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Share
        </button>
      </div>
    </div>
  );
};

export default AchievementProgressTracker;