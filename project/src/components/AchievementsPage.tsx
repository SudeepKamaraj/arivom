import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/apiService';

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
  estimatedTime?: string;
  prerequisites?: string[];
}

interface XpInfo {
  xp: number;
  level: number;
  dailyXpEarned: number;
  dailyXpCap: number;
  dailyXpRemaining: number;
  streak: {
    current: number;
    longest: number;
  };
  nextLevelXP: number;
  xpForNextLevel: number;
  progress: number;
}

const AchievementsPage = () => {
  const { currentUser } = useAuth();
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [inProgressAchievements, setInProgressAchievements] = useState<Achievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [xpInfo, setXpInfo] = useState<XpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'earned' | 'progress' | 'all' | 'stats'>('earned');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'xp' | 'date'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAchievementModal, setShowAchievementModal] = useState<Achievement | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [achievementStats, setAchievementStats] = useState<any>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user achievements
        const achievementsRes = await fetchWithAuth(`/achievements/user`);
        
        if (!achievementsRes.ok) {
          throw new Error('Failed to load achievements');
        }
        
        const achievementsData = await achievementsRes.json();
        setEarnedAchievements(achievementsData.earned || []);
        setInProgressAchievements(achievementsData.inProgress || []);
        setRecentAchievements((achievementsData.earned || []).slice(0, 3));
        
        // Fetch all achievements
        const allAchievementsRes = await fetchWithAuth(`/achievements`);
        let allAchievementsData = [];
        if (allAchievementsRes.ok) {
          allAchievementsData = await allAchievementsRes.json();
          setAllAchievements(allAchievementsData);
        }
        
        // Fetch XP info
        const xpInfoRes = await fetchWithAuth(`/achievements/xp/user`);
        
        if (!xpInfoRes.ok) {
          throw new Error('Failed to load XP information');
        }
        
        const xpInfoData = await xpInfoRes.json();
        setXpInfo(xpInfoData);

        // Calculate achievement stats
        const totalAchievements = (achievementsData.earned || []).length + (achievementsData.inProgress || []).length;
        const completionRate = totalAchievements > 0 ? ((achievementsData.earned || []).length / totalAchievements) * 100 : 0;
        
        setAchievementStats({
          totalEarned: (achievementsData.earned || []).length,
          inProgress: (achievementsData.inProgress || []).length,
          totalAvailable: allAchievementsData.length,
          completionRate: Math.round(completionRate),
          totalXpEarned: (achievementsData.earned || []).reduce((sum: number, a: Achievement) => sum + a.xpReward, 0)
        });
      } catch (err) {
        console.error('Error loading achievements:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadAchievements();
  }, [currentUser]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'uncommon': return 'bg-green-100 text-green-700 border-green-300';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-yellow-500';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-lg shadow-yellow-300/50';
      case 'epic': return 'shadow-lg shadow-purple-300/50';
      case 'rare': return 'shadow-md shadow-blue-300/50';
      default: return '';
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

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filterAchievements = (achievements: Achievement[]) => {
    return achievements
      .filter(achievement => {
        if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
        if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) return false;
        if (searchQuery && !achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !achievement.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rarity':
            const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
          case 'xp':
            return b.xpReward - a.xpReward;
          case 'date':
            if (a.earnedAt && b.earnedAt) {
              return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
            }
            return 0;
          default:
            return a.name.localeCompare(b.name);
        }
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
        <p>Error loading achievements: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Achievement Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your learning journey, unlock rewards, and celebrate your progress
          </p>
        </div>

        {/* Enhanced XP and Level Info */}
        {xpInfo && (
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Level Display */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-2xl font-bold mb-4">
                  {xpInfo.level}
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Level {xpInfo.level}</h2>
                <p className="text-gray-600 text-lg">{xpInfo.xp.toLocaleString()} XP Total</p>
              </div>

              {/* Progress Bar */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Level {xpInfo.level}</span>
                    <span className="text-sm font-medium text-gray-700">Level {xpInfo.level + 1}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                      style={{ width: `${xpInfo.progress}%` }}
                    >
                      <span className="text-white text-xs font-bold">{Math.round(xpInfo.progress)}%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    {xpInfo.xpForNextLevel - (xpInfo.xp - (xpInfo.nextLevelXP - xpInfo.xpForNextLevel))} XP needed for next level
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-2xl font-bold text-orange-600">{xpInfo.streak?.current || 0}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                    {xpInfo.streak?.longest > 0 && (
                      <div className="text-xs text-gray-500 mt-1">Best: {xpInfo.streak.longest}</div>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-2xl font-bold text-green-600">{xpInfo.dailyXpRemaining}</div>
                    <div className="text-sm text-gray-600">XP Remaining Today</div>
                    <div className="text-xs text-gray-500 mt-1">of {xpInfo.dailyXpCap} cap</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Stats Cards */}
        {achievementStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-800">{achievementStats.totalEarned}</p>
                  <p className="text-gray-600">Earned</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-800">{achievementStats.inProgress}</p>
                  <p className="text-gray-600">In Progress</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-800">{achievementStats.completionRate}%</p>
                  <p className="text-gray-600">Completion</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-800">{achievementStats.totalXpEarned}</p>
                  <p className="text-gray-600">XP Earned</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <nav className="flex space-x-2">
              {[
                { key: 'earned', label: 'Earned', count: earnedAchievements.length, icon: '🏆' },
                { key: 'progress', label: 'In Progress', count: inProgressAchievements.length, icon: '⏳' },
                { key: 'all', label: 'All Achievements', count: allAchievements.length, icon: '📜' },
                { key: 'stats', label: 'Statistics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.key ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters and Search (for all achievements tab) */}
        {activeTab === 'all' && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="course">Course</option>
                  <option value="assessment">Assessment</option>
                  <option value="streak">Streak</option>
                  <option value="community">Community</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="rarity">Rarity</option>
                  <option value="xp">XP Reward</option>
                  <option value="date">Date Earned</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <span className="text-lg">⊞</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <span className="text-lg">☰</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Content */}
        {activeTab === 'earned' && (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {earnedAchievements.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No achievements earned yet</h3>
                <p className="text-gray-600 mb-6">Complete courses, assessments, and participate to earn your first achievement!</p>
                <button 
                  onClick={() => setActiveTab('all')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Explore All Achievements
                </button>
              </div>
            ) : (
              filterAchievements(earnedAchievements).map((achievement) => (
                <div 
                  key={achievement._id} 
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${getRarityGlow(achievement.rarity)}`}
                  onClick={() => setShowAchievementModal(achievement)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl" title={achievement.category}>
                          {getCategoryIcon(achievement.category)}
                        </span>
                        {achievement.difficulty && (
                          <span className="text-yellow-400 text-sm">
                            {getDifficultyStars(achievement.difficulty)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 mr-4 flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <img 
                          src={achievement.icon || '/assets/default-achievement.png'} 
                          alt="" 
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{achievement.name}</h3>
                        {achievement.estimatedTime && (
                          <p className="text-sm text-gray-500">~{achievement.estimatedTime}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{achievement.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                          +{achievement.xpReward} XP
                        </span>
                        {achievement.isChained && (
                          <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                            🔗 Chained
                          </span>
                        )}
                      </div>
                      {achievement.earnedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {inProgressAchievements.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No achievements in progress</h3>
                <p className="text-gray-600">Start working towards new achievements!</p>
              </div>
            ) : (
              filterAchievements(inProgressAchievements).map((achievement) => (
                <div 
                  key={achievement._id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setShowAchievementModal(achievement)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <span className="text-2xl" title={achievement.category}>
                        {getCategoryIcon(achievement.category)}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 mr-4 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <img 
                          src={achievement.icon || '/assets/default-achievement.png'} 
                          alt="" 
                          className="w-10 h-10 object-contain opacity-60"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{achievement.name}</h3>
                        {achievement.estimatedTime && (
                          <p className="text-sm text-gray-500">~{achievement.estimatedTime}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{achievement.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{achievement.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(achievement.progress || 0)}`}
                          style={{ width: `${achievement.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                        +{achievement.xpReward} XP
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((100 - (achievement.progress || 0)) / 100 * (achievement.xpReward || 0))} XP remaining
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {filterAchievements(allAchievements).map((achievement) => {
              const isEarned = earnedAchievements.some(e => e._id === achievement._id);
              const inProgress = inProgressAchievements.find(p => p._id === achievement._id);
              
              return (
                <div 
                  key={achievement._id} 
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    isEarned ? getRarityGlow(achievement.rarity) : ''
                  } ${isEarned ? '' : 'opacity-75'}`}
                  onClick={() => setShowAchievementModal(achievement)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl" title={achievement.category}>
                          {getCategoryIcon(achievement.category)}
                        </span>
                        {isEarned && <span className="text-green-500 text-lg">✓</span>}
                        {inProgress && <span className="text-yellow-500 text-lg">⏳</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className={`w-16 h-16 mr-4 flex-shrink-0 rounded-xl flex items-center justify-center ${
                        isEarned ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                        <img 
                          src={achievement.icon || '/assets/default-achievement.png'} 
                          alt="" 
                          className={`w-10 h-10 object-contain ${isEarned ? '' : 'opacity-50'}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{achievement.name}</h3>
                        {achievement.estimatedTime && (
                          <p className="text-sm text-gray-500">~{achievement.estimatedTime}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{achievement.description}</p>
                    
                    {inProgress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{inProgress.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(inProgress.progress || 0)}`}
                            style={{ width: `${inProgress.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                          +{achievement.xpReward} XP
                        </span>
                        {achievement.isChained && (
                          <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                            🔗
                          </span>
                        )}
                      </div>
                      {isEarned && achievement.earnedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'stats' && achievementStats && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Achievement Statistics</h2>
            
            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement._id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 mr-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <img 
                            src={achievement.icon || '/assets/default-achievement.png'} 
                            alt="" 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{achievement.name}</h4>
                          <p className="text-xs text-gray-600">+{achievement.xpReward} XP</p>
                        </div>
                      </div>
                      {achievement.earnedAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rarity Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Achievement Breakdown by Rarity</h3>
                <div className="space-y-3">
                  {['legendary', 'epic', 'rare', 'uncommon', 'common'].map((rarity) => {
                    const count = earnedAchievements.filter(a => a.rarity === rarity).length;
                    const total = allAchievements.filter(a => a.rarity === rarity).length;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={rarity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(rarity)}`}>
                            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                          </span>
                          <span className="ml-3 text-sm text-gray-600">
                            {count} / {total}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Category Progress</h3>
                <div className="space-y-3">
                  {['course', 'assessment', 'streak', 'community', 'special'].map((category) => {
                    const count = earnedAchievements.filter(a => a.category === category).length;
                    const total = allAchievements.filter(a => a.category === category).length;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={category} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                            <span className="font-medium text-gray-800 capitalize">{category}</span>
                          </div>
                          <span className="text-sm text-gray-600">{count} / {total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Detail Modal */}
        {showAchievementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 mr-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <img 
                      src={showAchievementModal.icon || '/assets/default-achievement.png'} 
                      alt="" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{showAchievementModal.name}</h3>
                    <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full border ${getRarityColor(showAchievementModal.rarity)}`}>
                      {showAchievementModal.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAchievementModal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{showAchievementModal.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="flex items-center">
                    <span className="mr-2">{getCategoryIcon(showAchievementModal.category)}</span>
                    {showAchievementModal.category.charAt(0).toUpperCase() + showAchievementModal.category.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">XP Reward:</span>
                  <span className="text-green-600 font-medium">+{showAchievementModal.xpReward} XP</span>
                </div>
                
                {showAchievementModal.difficulty && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="text-yellow-500">{getDifficultyStars(showAchievementModal.difficulty)}</span>
                  </div>
                )}
                
                {showAchievementModal.estimatedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Time:</span>
                    <span>{showAchievementModal.estimatedTime}</span>
                  </div>
                )}
                
                {showAchievementModal.earnedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Earned:</span>
                    <span>{new Date(showAchievementModal.earnedAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                {showAchievementModal.progress !== undefined && showAchievementModal.progress < 100 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{showAchievementModal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(showAchievementModal.progress)}`}
                        style={{ width: `${showAchievementModal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
