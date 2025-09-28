import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/apiService';

interface LeaderboardUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  xp: number;
  level: number;
  streak: {
    current: number;
  };
  profilePicture?: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const Leaderboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'xp' | 'achievements' | 'streak'>('xp');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, timeFilter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth(`/achievements/leaderboard?type=${activeTab}&period=${timeFilter}`);
      
      if (!response.ok) {
        throw new Error('Failed to load leaderboard');
      }
      
      const data = await response.json();
      setLeaderboardData(data);
      
      // Find current user's rank if logged in
      if (currentUser && data.leaderboard) {
        const userIndex = data.leaderboard.findIndex(user => user._id === currentUser.id);
        setCurrentUserRank(userIndex >= 0 ? userIndex + 1 : null);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDisplayName = (user: LeaderboardUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'xp': return '⭐';
      case 'achievements': return '🏆';
      case 'streak': return '🔥';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
        <p>Error loading leaderboard: {error}</p>
        <button 
          onClick={loadLeaderboard}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="mr-3">🏆</span>
            Leaderboard
          </h2>
          <div className="text-right">
            <div className="text-sm opacity-90">Your Rank</div>
            <div className="text-2xl font-bold">
              {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4">
          {[
            { key: 'xp', label: 'XP Leaders' },
            { key: 'achievements', label: 'Achievement Kings' },
            { key: 'streak', label: 'Streak Masters' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <span className="mr-2">{getTabIcon(tab.key)}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'month', label: 'This Month' },
            { key: 'week', label: 'This Week' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                timeFilter === filter.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current User Card (if ranked but not in top 10) */}
      {currentUser && currentUserRank && currentUserRank > 10 && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${getRankColor(currentUserRank)}`}>
                #{currentUserRank}
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-3 overflow-hidden">
                {currentUser.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-600 font-bold">
                    {(currentUser.firstName?.[0] || currentUser.username?.[0] || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-800">You</div>
                <div className="text-sm text-gray-600">
                  {getDisplayName(currentUser as any)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800">
                {activeTab === 'xp' && `${currentUser.xp || 0} XP`}
                {activeTab === 'achievements' && `${currentUser.achievements?.length || 0} 🏆`}
                {activeTab === 'streak' && `${currentUser.streak?.current || 0} 🔥`}
              </div>
              <div className="text-sm text-gray-600">Level {currentUser.level || 1}</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-200">
        {leaderboardData?.leaderboard.length === 0 ? (
          <div className="text-center p-12">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No rankings yet</h3>
            <p className="text-gray-600">Be the first to start learning and earning XP!</p>
          </div>
        ) : (
          leaderboardData?.leaderboard.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = currentUser?.id === user._id;
            
            return (
              <div
                key={user._id}
                className={`p-4 transition-all duration-200 hover:bg-gray-50 ${
                  isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${getRankColor(rank)}`}>
                      {getRankIcon(rank)}
                    </div>

                    {/* Profile Picture */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4 overflow-hidden">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center">
                        {getDisplayName(user)}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Level {user.level} • {user.streak.current} day streak
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      {activeTab === 'xp' && `${user.xp.toLocaleString()} XP`}
                      {activeTab === 'achievements' && `${user.achievements?.length || 0} 🏆`}
                      {activeTab === 'streak' && `${user.streak.current} 🔥`}
                    </div>
                    {rank <= 3 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {rank === 1 && '👑 Champion'}
                        {rank === 2 && '🥈 Runner-up'}
                        {rank === 3 && '🥉 Third Place'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Achievement Highlights for top 3 */}
                {rank <= 3 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Recent Achievement</div>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">🏆</span>
                      <span className="font-medium">Course Master</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-600">+500 XP</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {leaderboardData && leaderboardData.pagination.pages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, leaderboardData.pagination.pages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  page === leaderboardData.pagination.page
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {!currentUser && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Join the Competition!</h3>
          <p className="text-gray-600 mb-4">Sign up to start earning XP and climb the leaderboard</p>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            Get Started
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;