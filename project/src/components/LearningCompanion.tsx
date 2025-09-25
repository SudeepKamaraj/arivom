import React, { useState, useEffect } from 'react';
import { Brain, MessageCircle, Target, TrendingUp, BookOpen, Clock, Award, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/apiService';

interface LearningCompanionProps {
  courseId?: string;
  className?: string;
}

interface CompanionInsight {
  type: 'suggestion' | 'motivation' | 'warning' | 'celebration';
  title: string;
  message: string;
  action?: string;
  actionCallback?: () => void;
}

interface LearningPattern {
  bestLearningTime: string;
  averageSessionDuration: number;
  strugglingTopics: string[];
  strongTopics: string[];
  learningSpeed: 'fast' | 'moderate' | 'slow';
  consistency: number; // 0-100
}

const LearningCompanion: React.FC<LearningCompanionProps> = ({ courseId, className = '' }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<CompanionInsight[]>([]);
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Fetch real AI analysis of user behavior
  useEffect(() => {
    if (!user) return;
    fetchLearningData();
  }, [user, courseId]);

  const fetchLearningData = async () => {
    try {
      // Fetch learning analytics and insights
      const [analyticsRes, insightsRes] = await Promise.all([
        fetchWithAuth('/learning/analytics'),
        fetchWithAuth('/learning/insights')
      ]);

      const analyticsData = await analyticsRes.json();
      const insightsData = await insightsRes.json();

      // Set learning pattern from analytics
      setLearningPattern(analyticsData.learningPattern);
      
      // Transform insights data to match component interface
      const transformedInsights: CompanionInsight[] = insightsData.insights.map((insight: any) => ({
        type: insight.type,
        title: insight.title,
        message: insight.message,
        action: insight.action
      }));
      
      setInsights(transformedInsights);
      
    } catch (error) {
      console.error('Error fetching learning data:', error);
      // Fallback to sample data if API fails
      generatePersonalizedInsights();
      analyzeLearningPattern();
    }
  };

  const generatePersonalizedInsights = () => {
    const sampleInsights: CompanionInsight[] = [
      {
        type: 'suggestion',
        title: '🎯 Welcome to Learning Companion',
        message: 'Complete a few courses to get personalized insights about your learning patterns!',
        action: 'Schedule Now'
      },
      {
        type: 'motivation',
        title: '🔥 Keep the Streak!',
        message: 'You\'ve been consistent for 5 days straight! Just 2 more days to unlock the "Week Warrior" badge.',
        action: 'View Progress'
      },
      {
        type: 'warning',
        title: '⚠️ Concept Gap Detected',
        message: 'You might want to review "Arrays" before moving to "Sorting Algorithms" - it will make learning easier!',
        action: 'Review Now'
      },
      {
        type: 'celebration',
        title: '🎉 Milestone Achieved!',
        message: 'Congratulations! You\'ve mastered the fundamentals. You\'re ready for intermediate topics!',
        action: 'Explore Next Level'
      }
    ];

    setInsights(sampleInsights);
  };

  const analyzeLearningPattern = () => {
    // Simulate learning pattern analysis
    setLearningPattern({
      bestLearningTime: '9:00 - 11:00 AM',
      averageSessionDuration: 45,
      strugglingTopics: ['Advanced Algorithms', 'System Design'],
      strongTopics: ['Basic Programming', 'Data Structures'],
      learningSpeed: 'moderate',
      consistency: 75
    });
  };

  const getMotivationalQuotes = () => {
    const quotes = [
      "The expert in anything was once a beginner. Keep going! 💪",
      "Your potential is endless. Every lesson brings you closer to mastery! 🌟",
      "Small progress is still progress. You're doing great! 📈",
      "Every expert was once a beginner. You're on the right path! 🚀",
      "The best investment you can make is in yourself. Keep learning! 💡"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <Brain className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Learning Companion</h3>
            <p className="text-sm text-gray-600">Your personalized learning guide</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Learning Pattern Summary */}
      {learningPattern && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
            Your Learning Pattern
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Best Time:</span>
              <p className="font-medium text-blue-600">{learningPattern.bestLearningTime}</p>
            </div>
            <div>
              <span className="text-gray-600">Avg. Session:</span>
              <p className="font-medium text-blue-600">{learningPattern.averageSessionDuration}min</p>
            </div>
            <div>
              <span className="text-gray-600">Learning Speed:</span>
              <p className="font-medium text-green-600 capitalize">{learningPattern.learningSpeed}</p>
            </div>
            <div>
              <span className="text-gray-600">Consistency:</span>
              <p className="font-medium text-purple-600">{learningPattern.consistency}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Insight */}
      {insights.length > 0 && (
        <div className="mb-4">
          <div className={`rounded-lg p-4 border-l-4 ${
            insights[currentTip].type === 'suggestion' ? 'bg-blue-50 border-blue-400' :
            insights[currentTip].type === 'motivation' ? 'bg-green-50 border-green-400' :
            insights[currentTip].type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
            'bg-pink-50 border-pink-400'
          }`}>
            <h4 className="font-medium text-gray-900 mb-2">
              {insights[currentTip].title}
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              {insights[currentTip].message}
            </p>
            {insights[currentTip].action && (
              <button className="text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-md px-3 py-1 transition-colors">
                {insights[currentTip].action}
              </button>
            )}
          </div>
          
          {/* Tip Navigation */}
          <div className="flex items-center justify-center space-x-2 mt-3">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTip ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Daily Motivation */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <Award className="w-4 h-4 mr-2 text-orange-500" />
          Daily Motivation
        </h4>
        <p className="text-sm text-gray-700 italic">
          {getMotivationalQuotes()}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
          <Target className="w-4 h-4" />
          <span>Set Goal</span>
        </button>
        <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
          <Users className="w-4 h-4" />
          <span>Find Study Buddy</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Powered by AI • Updated in real-time
        </p>
      </div>
    </div>
  );
};

export default LearningCompanion;