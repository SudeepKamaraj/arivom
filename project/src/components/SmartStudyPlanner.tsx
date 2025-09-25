import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, Brain, Zap, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/apiService';

interface StudyPlannerProps {
  courseId?: string;
  className?: string;
}

interface StudySession {
  id: string;
  courseId: string;
  courseTitle: string;
  topic: string;
  duration: number; // in minutes
  scheduledTime: Date;
  type: 'video' | 'practice' | 'review' | 'assessment';
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  priority: number; // 1-5
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number; // 0-100
  type: 'course_completion' | 'skill_mastery' | 'certification' | 'custom';
}

const SmartStudyPlanner: React.FC<StudyPlannerProps> = ({ courseId, className = '' }) => {
  const { user } = useAuth();
  const [todaysSessions, setTodaysSessions] = useState<StudySession[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<StudyGoal[]>([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [optimalTime, setOptimalTime] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (!user) return;
    
    fetchStudyPlan();
  }, [user, courseId]);

  const fetchStudyPlan = async () => {
    try {
      const response = await fetchWithAuth('/learning/study-schedule');
      const data = await response.json();
      
      setTodaysSessions(data.sessions || []);
      
      // Set mock goals for now - you can add goals API later
      loadUserGoals();
      calculateStudyStreak();
      determineOptimalStudyTime();
      
    } catch (error) {
      console.error('Error fetching study plan:', error);
      generateSmartStudyPlan();
    }
  };

  const generateSmartStudyPlan = () => {
    // Simulate AI-generated study sessions based on user's learning pattern
    const sessions: StudySession[] = [
      {
        id: '1',
        courseId: courseId || 'course1',
        courseTitle: 'JavaScript Fundamentals',
        topic: 'Async/Await Concepts',
        duration: 25,
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        type: 'video',
        difficulty: 'medium',
        completed: false,
        priority: 5
      },
      {
        id: '2',
        courseId: courseId || 'course1',
        courseTitle: 'JavaScript Fundamentals',
        topic: 'Practice: Promises',
        duration: 15,
        scheduledTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        type: 'practice',
        difficulty: 'medium',
        completed: false,
        priority: 4
      },
      {
        id: '3',
        courseId: courseId || 'course2',
        courseTitle: 'React Advanced',
        topic: 'Review: Hooks Fundamentals',
        duration: 10,
        scheduledTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
        type: 'review',
        difficulty: 'easy',
        completed: false,
        priority: 3
      }
    ];

    setTodaysSessions(sessions);
  };

  const loadUserGoals = () => {
    const goals: StudyGoal[] = [
      {
        id: '1',
        title: 'Complete JavaScript Course',
        description: 'Finish all modules and pass the final assessment',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        progress: 65,
        type: 'course_completion'
      },
      {
        id: '2',
        title: 'Master React Fundamentals',
        description: 'Build 3 projects using React hooks and state management',
        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        progress: 30,
        type: 'skill_mastery'
      }
    ];

    setWeeklyGoals(goals);
  };

  const calculateStudyStreak = () => {
    // Simulate streak calculation
    setStudyStreak(7);
  };

  const determineOptimalStudyTime = () => {
    // Simulate AI analysis of user's performance data
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour <= 11) {
      setOptimalTime('Morning Peak Time! 🌅');
      setEnergyLevel('high');
    } else if (currentHour >= 14 && currentHour <= 17) {
      setOptimalTime('Afternoon Focus Time 🎯');
      setEnergyLevel('medium');
    } else {
      setOptimalTime('Evening Review Time 🌙');
      setEnergyLevel('low');
    }
  };

  const markSessionComplete = (sessionId: string) => {
    setTodaysSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, completed: true }
          : session
      )
    );
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'review': return <Brain className="w-4 h-4" />;
      case 'assessment': return <CheckCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEnergyLevelRecommendation = () => {
    switch (energyLevel) {
      case 'high':
        return {
          message: 'Perfect time for challenging topics!',
          recommendation: 'Tackle difficult concepts now',
          color: 'text-green-600'
        };
      case 'medium':
        return {
          message: 'Good time for practice sessions',
          recommendation: 'Focus on hands-on exercises',
          color: 'text-yellow-600'
        };
      case 'low':
        return {
          message: 'Ideal for review and light topics',
          recommendation: 'Review previous concepts',
          color: 'text-blue-600'
        };
      default:
        return {
          message: 'Ready to learn!',
          recommendation: 'Start with your planned session',
          color: 'text-gray-600'
        };
    }
  };

  const energyRec = getEnergyLevelRecommendation();

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Smart Study Planner</h3>
            <p className="text-sm text-gray-600">AI-optimized learning schedule</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{studyStreak}</div>
          <div className="text-xs text-gray-500">day streak 🔥</div>
        </div>
      </div>

      {/* Energy Level & Optimal Time */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-600" />
            {optimalTime}
          </h4>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              energyLevel === 'high' ? 'bg-green-400' :
              energyLevel === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
            }`}></div>
            <span className="text-sm text-gray-600 capitalize">{energyLevel} Energy</span>
          </div>
        </div>
        <p className={`text-sm ${energyRec.color} font-medium`}>
          {energyRec.message}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          💡 {energyRec.recommendation}
        </p>
      </div>

      {/* Today's Study Sessions */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-purple-600" />
          Today's Sessions ({todaysSessions.filter(s => !s.completed).length} remaining)
        </h4>
        <div className="space-y-2">
          {todaysSessions.map((session) => (
            <div
              key={session.id}
              className={`border rounded-lg p-3 transition-all ${
                session.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded ${
                    session.completed ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {session.completed ? <CheckCircle className="w-4 h-4" /> : getSessionTypeIcon(session.type)}
                  </div>
                  <div>
                    <p className={`font-medium ${session.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                      {session.topic}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span>{session.courseTitle}</span>
                      <span>•</span>
                      <span>{session.duration}min</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {session.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!session.completed && (
                    <button
                      onClick={() => markSessionComplete(session.id)}
                      className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2 text-orange-600" />
          Weekly Goals
        </h4>
        <div className="space-y-3">
          {weeklyGoals.map((goal) => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{goal.title}</h5>
                <span className="text-sm font-medium text-purple-600">{goal.progress}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  Due {goal.targetDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
          Adjust Schedule
        </button>
        <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
          Add Goal
        </button>
      </div>

      {/* AI Insights */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">AI Insight</p>
            <p className="text-xs text-yellow-700">
              You're 23% more productive when studying JavaScript in 25-minute focused sessions. 
              Consider using the Pomodoro technique for better retention!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartStudyPlanner;