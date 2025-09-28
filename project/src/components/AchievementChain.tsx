import React from 'react';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  earnedAt?: string;
  progress?: number;
  isChained?: boolean;
  chainedFrom?: string;
  difficulty?: number;
}

interface AchievementChainProps {
  achievements: Achievement[];
  title: string;
  description?: string;
  onAchievementClick?: (achievement: Achievement) => void;
}

const AchievementChain: React.FC<AchievementChainProps> = ({
  achievements,
  title,
  description,
  onAchievementClick
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50';
      default: return 'border-gray-300 bg-gray-50';
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

  const getDifficultyStars = (difficulty?: number) => {
    if (!difficulty) return '';
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const isEarned = (achievement: Achievement) => !!achievement.earnedAt;
  const isInProgress = (achievement: Achievement) => 
    !achievement.earnedAt && (achievement.progress ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <span className="mr-3">🔗</span>
          {title}
        </h3>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      <div className="relative">
        {/* Chain Path */}
        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-purple-300 z-0"></div>

        {/* Achievements */}
        <div className="space-y-6 relative z-10">
          {achievements.map((achievement, index) => {
            const earned = isEarned(achievement);
            const inProgress = isInProgress(achievement);
            const isLocked = !earned && !inProgress && index > 0 && !isEarned(achievements[index - 1]);

            return (
              <div
                key={achievement._id}
                className={`relative flex items-start transition-all duration-300 ${
                  onAchievementClick ? 'cursor-pointer hover:transform hover:scale-105' : ''
                } ${isLocked ? 'opacity-50' : ''}`}
                onClick={() => onAchievementClick?.(achievement)}
              >
                {/* Chain Node */}
                <div className={`
                  w-16 h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0 z-20
                  ${earned 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500' 
                    : inProgress 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-500'
                      : isLocked
                        ? 'bg-gray-200 border-gray-300'
                        : 'bg-white border-gray-300'
                  }
                `}>
                  {earned ? (
                    <span className="text-white text-2xl">✓</span>
                  ) : inProgress ? (
                    <span className="text-white text-2xl">⏳</span>
                  ) : isLocked ? (
                    <span className="text-gray-400 text-2xl">🔒</span>
                  ) : (
                    <img 
                      src={achievement.icon || '/assets/default-achievement.png'} 
                      alt="" 
                      className="w-8 h-8 object-contain opacity-70"
                    />
                  )}
                </div>

                {/* Achievement Card */}
                <div className={`
                  ml-6 flex-1 p-4 rounded-xl border-2 transition-all duration-300
                  ${earned 
                    ? `${getRarityColor(achievement.rarity)} shadow-md` 
                    : inProgress
                      ? 'border-yellow-300 bg-yellow-50 shadow-md'
                      : isLocked
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <img 
                          src={achievement.icon || '/assets/default-achievement.png'} 
                          alt="" 
                          className={`w-6 h-6 object-contain ${earned ? '' : 'opacity-60'}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">
                            {getCategoryIcon(achievement.category)} {achievement.category}
                          </span>
                          {achievement.difficulty && (
                            <span className="text-yellow-400 text-xs">
                              {getDifficultyStars(achievement.difficulty)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`
                        inline-block px-3 py-1 rounded-full text-xs font-bold
                        ${earned 
                          ? 'bg-green-100 text-green-700' 
                          : inProgress
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                        +{achievement.xpReward} XP
                      </span>
                      {earned && achievement.earnedAt && (
                        <span className="text-xs text-gray-500">
                          Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {inProgress && achievement.progress !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{achievement.progress}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isLocked && index > 0 && (
                    <div className="mt-3 p-2 bg-gray-100 rounded-lg text-center">
                      <span className="text-sm text-gray-600">
                        🔒 Complete "{achievements[index - 1].name}" to unlock
                      </span>
                    </div>
                  )}
                </div>

                {/* Chain Progress Indicator */}
                {index < achievements.length - 1 && (
                  <div className={`
                    absolute left-8 top-20 w-0.5 h-6 z-30
                    ${earned 
                      ? 'bg-gradient-to-b from-green-500 to-green-400' 
                      : 'bg-gray-300'
                    }
                  `}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chain Completion Status */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">Chain Progress</h4>
              <p className="text-sm text-gray-600">
                {achievements.filter(a => isEarned(a)).length} of {achievements.length} completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((achievements.filter(a => isEarned(a)).length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(achievements.filter(a => isEarned(a)).length / achievements.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementChain;