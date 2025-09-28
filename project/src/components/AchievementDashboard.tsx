import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/apiService';
import AchievementChain from './AchievementChain';
import Leaderboard from './Leaderboard';

interface AchievementAnalytics {
  global: {
    totalAchievements: number;
    totalUsers: number;
    categoryBreakdown: Array<{ _id: string; count: number }>;
    rarityBreakdown: Array<{ _id: string; count: number }>;
    popularAchievements: Array<{
      achievement: any;
      earnedBy: number;
      percentage: number;
    }>;
  };
  user?: {
    earned: number;
    inProgress: number;
    totalAvailable: number;
    completionRate: number;
    totalXpEarned: number;
    rank: number;
  };
}

interface AchievementTrend {
  date: string;
  earned: number;
  xp: number;
}

const AchievementDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<AchievementAnalytics | null>(null);
  const [chains, setChains] = useState<any[]>([]);
  const [trends, setTrends] = useState<AchievementTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'chains' | 'leaderboard' | 'trends'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load analytics
      const analyticsRes = await fetchWithAuth('/achievements/stats');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      // Load achievement chains
      const chainsRes = await fetchWithAuth('/achievements/chains');
      if (chainsRes.ok) {
        const chainsData = await chainsRes.json();
        setChains(chainsData);
      }

      // Generate sample trend data (replace with real API call)
      const sampleTrends = generateSampleTrends();
      setTrends(sampleTrends);

    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleTrends = (): AchievementTrend[] => {
    const trends = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        earned: Math.floor(Math.random() * 5),
        xp: Math.floor(Math.random() * 200) + 50
      });
    }
    
    return trends;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
        <p>Error loading dashboard: {error}</p>
        <button 
          onClick={loadDashboardData}
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Achievement Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive insights into learning achievements and progress tracking
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <nav className="flex space-x-2">
              {[
                { key: 'overview', label: 'Overview', icon: '📊' },
                { key: 'chains', label: 'Achievement Chains', icon: '🔗' },
                { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
                { key: 'trends', label: 'Trends', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key as any)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeView === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{analytics.global.totalAchievements}</p>
                    <p className="text-gray-600">Total Achievements</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{analytics.global.totalUsers}</p>
                    <p className="text-gray-600">Active Users</p>
                  </div>
                </div>
              </div>

              {analytics.user && (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-800">{analytics.user.earned}</p>
                        <p className="text-gray-600">Your Achievements</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <span className="text-2xl">📈</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-800">#{analytics.user.rank}</p>
                        <p className="text-gray-600">Your Rank</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Category and Rarity Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Achievement Categories</h3>
                <div className="space-y-3">
                  {analytics.global.categoryBreakdown.map((category) => (
                    <div key={category._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getCategoryIcon(category._id)}</span>
                        <span className="font-medium capitalize">{category._id}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-800">{category.count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(category.count / analytics.global.totalAchievements) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rarity Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Rarity Distribution</h3>
                <div className="space-y-3">
                  {analytics.global.rarityBreakdown.map((rarity) => (
                    <div key={rarity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${getRarityColor(rarity._id)}`}></div>
                        <span className="font-medium capitalize">{rarity._id}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-800">{rarity.count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getRarityColor(rarity._id)}`}
                            style={{ width: `${(rarity.count / analytics.global.totalAchievements) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Most Popular Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.global.popularAchievements.slice(0, 6).map((item, index) => (
                  <div key={item.achievement._id} className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getCategoryIcon(item.achievement.category)}</span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{item.achievement.name}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.achievement.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        +{item.achievement.xpReward} XP
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {item.percentage}% earned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'chains' && (
          <div className="space-y-6">
            {chains.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Achievement Chains Found</h3>
                <p className="text-gray-600">Achievement chains will appear here when available.</p>
              </div>
            ) : (
              chains.map((chain, index) => (
                <AchievementChain
                  key={index}
                  achievements={chain.achievements}
                  title={chain.title}
                  description={chain.description}
                />
              ))
            )}
          </div>
        )}

        {activeView === 'leaderboard' && (
          <Leaderboard />
        )}

        {activeView === 'trends' && (
          <div className="space-y-8">
            {/* Achievement Trend Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">30-Day Achievement Trend</h3>
              <div className="h-64 flex items-end space-x-1">
                {trends.map((trend, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-sm"
                      style={{ height: `${(trend.earned / 5) * 100}%` }}
                      title={`${trend.date}: ${trend.earned} achievements`}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1 transform rotate-45">
                      {new Date(trend.date).getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-4">
                <span>Achievements earned per day</span>
                <span>Last 30 days</span>
              </div>
            </div>

            {/* XP Trend Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">30-Day XP Trend</h3>
              <div className="h-64 flex items-end space-x-1">
                {trends.map((trend, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-400 to-purple-600 rounded-t-sm"
                      style={{ height: `${(trend.xp / 250) * 100}%` }}
                      title={`${trend.date}: ${trend.xp} XP`}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1 transform rotate-45">
                      {new Date(trend.date).getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-4">
                <span>XP earned per day</span>
                <span>Last 30 days</span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {trends.reduce((sum, trend) => sum + trend.earned, 0)}
                </div>
                <div className="text-gray-600">Achievements This Month</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {trends.reduce((sum, trend) => sum + trend.xp, 0)}
                </div>
                <div className="text-gray-600">XP Earned This Month</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(trends.reduce((sum, trend) => sum + trend.earned, 0) / 30 * 10) / 10}
                </div>
                <div className="text-gray-600">Daily Average</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementDashboard;