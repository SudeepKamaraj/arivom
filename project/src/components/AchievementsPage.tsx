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
  const [xpInfo, setXpInfo] = useState<XpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'earned' | 'progress'>('earned');

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
        
        // Fetch XP info
        const xpInfoRes = await fetchWithAuth(`/achievements/xp/user`);
        
        if (!xpInfoRes.ok) {
          throw new Error('Failed to load XP information');
        }
        
        const xpInfoData = await xpInfoRes.json();
        setXpInfo(xpInfoData);
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
      case 'common': return 'bg-gray-300 text-gray-800';
      case 'uncommon': return 'bg-green-400 text-green-900';
      case 'rare': return 'bg-blue-400 text-blue-900';
      case 'epic': return 'bg-purple-400 text-purple-900';
      case 'legendary': return 'bg-yellow-400 text-yellow-900';
      default: return 'bg-gray-300 text-gray-800';
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Achievements & Progress</h1>
      
      {/* XP and Level Info */}
      {xpInfo && (
        <div className="mb-12 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Level {xpInfo.level}</h2>
              <p className="text-gray-600">{xpInfo.xp} XP total</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center">
                <span className="text-amber-600 mr-2">🔥</span>
                <span className="font-semibold">{xpInfo.streak?.current || 0} day streak</span>
                {xpInfo.streak?.longest > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Best: {xpInfo.streak.longest})
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mt-1">
                {xpInfo.dailyXpRemaining} / {xpInfo.dailyXpCap} XP remaining today
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Level {xpInfo.level}</span>
              <span>Level {xpInfo.level + 1}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${xpInfo.progress}%` }}
              ></div>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {xpInfo.xpForNextLevel - (xpInfo.xp - (xpInfo.nextLevelXP - xpInfo.xpForNextLevel))} XP needed for next level
            </div>
          </div>
        </div>
      )}

      {/* Achievement Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('earned')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'earned'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Earned ({earnedAchievements.length})
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In Progress ({inProgressAchievements.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'earned' && earnedAchievements.length === 0 && (
          <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">You haven't earned any achievements yet.</p>
            <p className="mt-2">Complete courses, assessments and participate to earn achievements!</p>
          </div>
        )}

        {activeTab === 'earned' && earnedAchievements.map((achievement) => (
          <div key={achievement._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                </span>
                <span className="text-2xl" title={achievement.category}>
                  {getCategoryIcon(achievement.category)}
                </span>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 mr-4 flex-shrink-0">
                  <img 
                    src={achievement.icon || '/assets/default-achievement.png'} 
                    alt="" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold">{achievement.name}</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">+{achievement.xpReward} XP</span>
                {achievement.earnedAt && (
                  <span className="text-gray-500">
                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'progress' && inProgressAchievements.length === 0 && (
          <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No achievements in progress.</p>
          </div>
        )}

        {activeTab === 'progress' && inProgressAchievements.map((achievement) => (
          <div key={achievement._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                </span>
                <span className="text-2xl" title={achievement.category}>
                  {getCategoryIcon(achievement.category)}
                </span>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 mr-4 flex-shrink-0">
                  <img 
                    src={achievement.icon || '/assets/default-achievement.png'} 
                    alt="" 
                    className="w-full h-full object-contain opacity-50"
                  />
                </div>
                <h3 className="text-lg font-bold">{achievement.name}</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-green-600 font-medium">+{achievement.xpReward} XP</span>
                <span className="text-gray-500">
                  {achievement.progress}% complete
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;