import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { TrendingUp, Star, Clock, Users, BookOpen, Target, Brain, Sparkles, Award, ArrowRight, Play, Lightbulb, Rocket, Search } from 'lucide-react';

interface RecommendationsProps {
  onCourseSelect: (course: any) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ onCourseSelect }) => {
  const { user } = useAuth();
  const { courses } = useCourses();
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any[]>([]);
  const [questionnaireRecommendations, setQuestionnaireRecommendations] = useState<any[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [questionnaireProfile, setQuestionnaireProfile] = useState<any>(null);

  // Fetch personalized recommendations from API
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        // Fetch personalized recommendations
        const personalizedResponse = await fetch('http://localhost:5001/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (personalizedResponse.ok) {
          const personalizedData = await personalizedResponse.json();
          setPersonalizedRecommendations(personalizedData.recommendations || []);
          setUserProfile(personalizedData.userProfile);
        }
        
        // Fetch questionnaire-based recommendations
        const questionnaireResponse = await fetch('http://localhost:5001/api/recommendations/questionnaire', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (questionnaireResponse.ok) {
          const questionnaireData = await questionnaireResponse.json();
          setQuestionnaireRecommendations(questionnaireData.recommendations || []);
          setQuestionnaireProfile(questionnaireData.questionnaire);
        }
        
        // Fetch trending courses
        const trendingResponse = await fetch('http://localhost:5001/api/recommendations/trending');
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          setTrendingCourses(trendingData.trending || []);
        }
        
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to existing course data
        setPersonalizedRecommendations(courses.slice(0, 6));
        setTrendingCourses(courses.filter(c => c.students > 1000).slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, courses]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
        <p className="text-gray-600">Please sign in to view personalized course recommendations.</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const CourseCard: React.FC<{ course: any; recommendation?: any }> = ({ course, recommendation }) => (
    <div
      onClick={() => onCourseSelect(course)}
      className="group relative bg-gradient-to-br from-white to-cyan-50/50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-cyan-900/20 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 cursor-pointer overflow-hidden border border-cyan-100/50 dark:border-cyan-800/30 hover:scale-105 hover:-translate-y-3 transform-gpu hover:border-cyan-300"
    >
      {/* Enhanced AI Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* AI Score Badge */}
      {recommendation?.recommendationScore && (
        <div className="absolute -top-3 -right-3 z-20">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-xl animate-pulse">
            <Brain className="w-5 h-5" />
            <span className="text-sm font-bold">{recommendation.recommendationScore}% AI Match</span>
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            src={course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title || 'Course thumbnail'}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvdXJzZSBJbWFnZTwvdGV4dD48L3N2Zz4=';
            }}
          />
          
          {/* Animated Play Button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-700 shadow-2xl">
              <Play className="w-12 h-12 text-cyan-600" />
            </div>
          </div>
          
          {/* Level Badge */}
          <div className="absolute top-6 left-6">
            <span className={`px-5 py-2 rounded-full text-sm font-bold backdrop-blur-lg border-2 transition-all duration-300 group-hover:scale-110 shadow-lg ${
              course.level === 'Beginner' 
                ? 'bg-emerald-100/95 text-emerald-700 border-emerald-300' :
              course.level === 'Intermediate' 
                ? 'bg-amber-100/95 text-amber-700 border-amber-300' :
                'bg-rose-100/95 text-rose-700 border-rose-300'
            }`}>
              {course.level || 'Beginner'}
            </span>
          </div>
          
          {/* Trending Badge */}
          {course.students && course.students > 1000 && (
            <div className="absolute bottom-4 left-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full flex items-center text-xs font-bold shadow-lg animate-pulse">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>HOT</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-8">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
            {course.title || 'Untitled Course'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
            {course.description || 'No description available'}
          </p>
          
          {/* AI Recommendation Reasons */}
          {recommendation?.recommendationReasons && recommendation.recommendationReasons.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">AI Insights:</span>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {recommendation.recommendationReasons.slice(0, 2).join(' • ')}
              </div>
            </div>
          )}
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:bg-cyan-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-cyan-100 group-hover:to-blue-100 transition-all duration-300 border border-cyan-100/50">
              <Clock className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{course.duration || '1h'}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-purple-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300 border border-purple-100/50">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-purple-700 dark:text-purple-300">{course.students ? course.students.toLocaleString() : '5'}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:bg-yellow-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-amber-100 group-hover:to-yellow-100 transition-all duration-300 border border-amber-100/50">
              <Star className="w-6 h-6 text-amber-500 mx-auto mb-2 fill-amber-500" />
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {!course.rating || course.rating.count === 0 
                  ? '4.2/5' 
                  : `${course.rating.average}/5`
                }
              </div>
            </div>
          </div>
          
          {/* Skills Tags with AI Enhancement */}
          <div className="flex flex-wrap gap-3 mb-6">
            {(course.skills || ['Programming', 'Development']).slice(0, 3).map((skill: string, index: number) => (
              <span
                key={skill}
                className={`px-4 py-2 text-sm font-semibold rounded-2xl transition-all duration-300 group-hover:scale-105 ${
                  userProfile?.skills?.includes(skill)
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : index === 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
                    index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                    'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                }`}
              >
                {userProfile?.skills?.includes(skill) && <Sparkles className="w-4 h-4 inline mr-1" />}
                {skill}
              </span>
            ))}
            {course.skills && course.skills.length > 3 && (
              <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-semibold">
                +{course.skills.length - 3} more
              </span>
            )}
          </div>
          
          {/* Enhanced Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {course.rating && course.rating.count > 0 && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.rating.average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({course.rating.count})</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ₹{course.price || 0}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-full shadow-lg">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Neural Network Glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl transform scale-110"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* AI-Powered Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-24 overflow-hidden">
        {/* Animated Neural Network Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-ping"></div>
          <div className="absolute bottom-32 right-1/3 w-28 h-28 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full animate-pulse"></div>
          
          {/* Neural Network Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 500">
            <line x1="100" y1="100" x2="300" y2="200" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse" />
            <line x1="300" y1="200" x2="500" y2="150" stroke="url(#gradient2)" strokeWidth="2" className="animate-pulse" />
            <line x1="500" y1="150" x2="700" y2="250" stroke="url(#gradient3)" strokeWidth="2" className="animate-pulse" />
            <line x1="700" y1="250" x2="900" y2="200" stroke="url(#gradient4)" strokeWidth="2" className="animate-pulse" />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 backdrop-blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-4 rounded-2xl">
                <Lightbulb className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">AI-Powered</span>
              <span className="block bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">Learning Recommendations</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Discover courses perfectly tailored to your skills, goals, and learning style through advanced AI analysis
            </p>
            
            {/* AI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Brain className="w-6 h-6 text-blue-300" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">AI</span>
                </div>
                <div className="text-blue-200 text-sm">Powered Analysis</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Target className="w-6 h-6 text-purple-300" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">99%</span>
                </div>
                <div className="text-blue-200 text-sm">Match Accuracy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Rocket className="w-6 h-6 text-pink-300" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent">10x</span>
                </div>
                <div className="text-blue-200 text-sm">Faster Learning</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

      {/* User Profile Overview */}
      {userProfile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Learning Profile</h2>
                <p className="text-sm text-gray-500">Track your progress and interests</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
              Profile Complete
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Skills */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Skills</h3>
              </div>
              <div className="space-y-2">
                {userProfile.skills?.map((skill: string) => (
                  <div
                    key={skill}
                    className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Interests */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Interests</h3>
              </div>
              <div className="space-y-2">
                {(() => {
                  const interests = Array.isArray(userProfile.interests) 
                    ? userProfile.interests 
                    : userProfile.interests ? [userProfile.interests] : [];
                  
                  return interests.length > 0 ? interests.map((interest: string) => (
                    <div
                      key={interest}
                      className="px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100"
                    >
                      {interest}
                    </div>
                  )) : (
                    <div className="px-3 py-2 bg-gray-50 text-gray-500 text-sm rounded-lg border border-gray-100">
                      No interests added
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Experience Level */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Experience Level</h3>
              </div>
              <div className="px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg border border-purple-100 font-medium">
                {userProfile.experienceLevel || 'Beginner'}
              </div>
            </div>
            
            {/* Completed Courses */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900">Completed Courses</h3>
              </div>
              <div className="space-y-2">
                {userProfile.completedCourses && userProfile.completedCourses.length > 0 ? (
                  userProfile.completedCourses.map((course: string) => (
                    <div
                      key={course}
                      className="px-3 py-2 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100"
                    >
                      {course}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 bg-gray-50 text-gray-500 text-sm rounded-lg border border-gray-100 text-center">
                    <div className="text-gray-400 mb-1">📚</div>
                    <div>No courses completed</div>
                    <div className="text-xs mt-1">Start learning today!</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {userProfile.skills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Array.isArray(userProfile.interests) ? userProfile.interests.length : (userProfile.interests ? 1 : 0)}
                </div>
                <div className="text-sm text-gray-600">Interests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {userProfile.completedCourses?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Questionnaire-Based Recommendations */}
        {questionnaireRecommendations.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Personalized Picks
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Based on your questionnaire responses
                    {questionnaireProfile?.completedAt && (
                      <span className="ml-2 text-sm text-purple-600">
                        • Updated {new Date(questionnaireProfile.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  ✨ {questionnaireRecommendations.length} Matches
                </span>
              </div>
            </div>

            {/* Questionnaire Summary */}
            {questionnaireProfile && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 mb-8 border border-purple-200/50 dark:border-purple-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Experience</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100 capitalize">
                      {questionnaireProfile.experience}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Interests</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100">
                      {questionnaireProfile.interests?.length || 0} Selected
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Time/Week</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100">
                      {questionnaireProfile.timeCommitment} hours
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Style</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100 capitalize">
                      {questionnaireProfile.learningStyle}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {questionnaireRecommendations.slice(0, 6).map((course, index) => (
                <div 
                  key={course._id || course.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CourseCard course={course} recommendation={{
                    recommendationScore: course.recommendationScore,
                    recommendationReasons: course.recommendationReasons
                  }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI-Powered Personalized Recommendations */}
        {personalizedRecommendations.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Curated For You
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Courses analyzed and selected by our advanced AI system
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-100 to-cyan-100 dark:from-emerald-900/30 dark:to-cyan-900/30 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-700">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                  AI Matched
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {personalizedRecommendations.slice(0, 6).map((course, index) => (
                <div 
                  key={course._id || course.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CourseCard course={course} recommendation={course} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Courses with Enhanced Design */}
        {trendingCourses.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Trending This Week
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Most popular courses right now
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-700">
                <span className="text-orange-700 dark:text-orange-300 font-semibold text-sm flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Hot</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingCourses.map((course, index) => (
                <div 
                  key={course._id || course.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Learning Insights */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 dark:border-purple-700/50">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
                <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Your AI Learning Journey
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our AI continuously learns from your progress and preferences to provide increasingly accurate recommendations
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/60">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Discovery</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">AI finds courses you never knew you needed</p>
              </div>
              <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/60">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Precision Matching</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">99% accuracy in skill-course alignment</p>
              </div>
              <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/60">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Adaptive Learning</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Recommendations improve with your progress</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Recommendations;
