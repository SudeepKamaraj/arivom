import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Clock, Search, Filter, ArrowRight, Play, Shield, BookOpen, Award, Target, Zap, TrendingUp, Globe, Heart, CheckCircle, Sparkles, Brain } from 'lucide-react';
import RecommendationModal from './RecommendationModal';

interface HomePageProps {
  onCourseSelect: (course: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCourseSelect }) => {
  const { user, loading } = useAuth();
  const { courses } = useCourses();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  const featuredCourses = courses.slice(0, 6);
  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (course.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleCourseSelect = (course: any) => {
    // Don't proceed if still loading authentication state
    if (loading) {
      return;
    }
    
    if (!user) {
      // Store selected course for post-auth redirect
      sessionStorage.setItem('selectedCourse', JSON.stringify(course));
      const courseSlug = course.id || course.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      navigate(`/auth?redirect=/courses/${courseSlug}`);
      return;
    }
    onCourseSelect(course);
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

    const CourseCard: React.FC<{ course: any; featured?: boolean }> = ({ course, featured = false }) => (
    <div
      onClick={() => handleCourseSelect(course)}
      className={`group relative bg-gradient-to-br from-white to-cyan-50/50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-cyan-900/20 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer overflow-hidden border border-cyan-100/50 dark:border-cyan-800/30 hover:scale-105 hover:-translate-y-2 hover:border-cyan-300 ${
        featured ? 'transform hover:scale-110' : ''
      }`}
    >
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative">
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            src={course.thumbnail || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200'}
            alt={course.title}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Animated Play Button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-5 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
              <Play className="w-10 h-10 text-cyan-600" />
            </div>
          </div>
          
          {/* Level Badge */}
          <div className="absolute top-6 left-6">
            <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-lg border-2 transition-all duration-300 group-hover:scale-110 shadow-lg ${
              course.level === 'Beginner' 
                ? 'bg-emerald-100/95 text-emerald-700 border-emerald-300' :
              course.level === 'Intermediate' 
                ? 'bg-amber-100/95 text-amber-700 border-amber-300' :
                'bg-rose-100/95 text-rose-700 border-rose-300'
            }`}>
              {course.level || 'Beginner'}
            </span>
          </div>
          
          {/* Price Badge */}
          <div className="absolute top-6 right-6">
            {course.price > 0 ? (
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full flex items-center text-sm font-bold shadow-xl">
                <span>₹{course.price}</span>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                FREE
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-8 relative">
        <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-6 line-clamp-3 leading-relaxed">
          {course.description}
        </p>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:bg-cyan-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-cyan-100 group-hover:to-blue-100 transition-all duration-300 border border-cyan-100/50">
            <Clock className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{course.duration || '1h'}</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-purple-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300 border border-purple-100/50">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300">{course.students ? course.students.toLocaleString() : '5'}</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:bg-yellow-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-amber-100 group-hover:to-yellow-100 transition-all duration-300 border border-amber-100/50">
            <Star className="w-5 h-5 text-amber-500 mx-auto mb-1 fill-amber-500" />
            <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
              {!course.rating || course.rating.count === 0 
                ? '4.2/5' 
                : `${course.rating.average}/5`
              }
            </div>
          </div>
        </div>
        
        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(course.skills || ['Programming', 'Development']).slice(0, 3).map((skill: string, index: number) => (
            <span
              key={skill}
              className={`px-3 py-2 text-sm font-semibold rounded-2xl transition-all duration-300 group-hover:scale-105 ${
                index === 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
                index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
              }`}
            >
              {skill}
            </span>
          ))}
          {course.skills && course.skills.length > 3 && (
            <span className="px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-2xl">
              +{course.skills.length - 3} more
            </span>
          )}
        </div>
        
        {/* Rating and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {course.rating && course.rating.count > 0 ? (
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.rating.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">({course.rating.count})</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">(5)</span>
              </div>
            )}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-full shadow-lg">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl transform scale-110"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="relative">
                <Shield className="h-12 w-12 text-white drop-shadow-lg" />
                <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Arivom Learning
              </h1>
            </div>
            
            <h2 className="text-5xl sm:text-7xl font-extrabold mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Transform Your Future</span>
              <span className="block bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">with AI-Powered Learning</span>
            </h2>
            
            <p className="text-xl sm:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Experience personalized education that adapts to your goals, powered by cutting-edge AI technology 
              and delivered by world-class experts from top companies and universities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {user ? (
                <>
                  <button
                    onClick={() => setShowRecommendationModal(true)}
                    className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center space-x-3"
                  >
                    <Brain className="h-6 w-6 group-hover:animate-pulse" />
                    <span>Get Recommendations</span>
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </button>
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/30"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/auth')}
                    className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center space-x-3"
                  >
                    <Play className="h-6 w-6 group-hover:animate-pulse" />
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/30"
                  >
                    Explore Courses
                  </button>
                </>
              )}
            </div>
            
            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">50K+</div>
                  <div className="text-blue-200 font-medium">Active Learners</div>
                  <div className="text-blue-300 text-sm mt-1">Growing Daily</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">1000+</div>
                  <div className="text-blue-200 font-medium">Expert Courses</div>
                  <div className="text-blue-300 text-sm mt-1">Industry Leaders</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent">95%</div>
                  <div className="text-blue-200 font-medium">Success Rate</div>
                  <div className="text-blue-300 text-sm mt-1">Proven Results</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">24/7</div>
                  <div className="text-blue-200 font-medium">AI Support</div>
                  <div className="text-blue-300 text-sm mt-1">Always Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Only show for non-authenticated users or as enhanced version */}
      {!user && (
        <section className="py-20 px-6 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose Arivom Learning?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the future of education with our revolutionary approach to personalized learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "AI-Powered Personalization",
                  description: "Advanced algorithms create personalized learning paths tailored to your unique goals, learning style, and career aspirations."
                },
                {
                  icon: Users,
                  title: "Global Learning Community",
                  description: "Connect with learners worldwide, participate in discussions, and grow together in a supportive, diverse environment."
                },
                {
                  icon: BookOpen,
                  title: "Expert-Led Content",
                  description: "Learn from industry experts, university professors, and successful entrepreneurs with real-world experience."
                },
                {
                  icon: Award,
                  title: "Verified Certificates",
                  description: "Earn industry-recognized certificates that boost your career prospects and showcase your achievements to employers."
                },
                {
                  icon: Zap,
                  title: "Interactive Learning",
                  description: "Engage with hands-on projects, simulations, and interactive assessments for deeper understanding and retention."
                },
                {
                  icon: TrendingUp,
                  title: "Progress Analytics",
                  description: "Monitor your growth with detailed analytics, celebrate milestones, and optimize your learning journey with data insights."
                }
              ].map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-gray-600 group">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Company Section - Only for non-authenticated users */}
      {!user && (
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                  Our Mission & Vision
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  At Arivom Learning, we believe that education should be accessible, engaging, and transformative. 
                  Our platform combines cutting-edge AI technology with proven pedagogical methods to create learning 
                  experiences that truly adapt to each individual learner.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-400 mb-8 leading-relaxed">
                  Founded by educators, technologists, and industry experts, we're committed to democratizing quality education 
                  and empowering learners worldwide to achieve their dreams and advance their careers.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium">Innovative AI Technology</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium">World-Class Instructors</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium">Global Community</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium">Career-Focused Learning</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-8 backdrop-blur-sm border border-blue-200 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">Global Reach</div>
                      <div className="text-gray-600 dark:text-gray-400">150+ Countries</div>
                    </div>
                    <div className="text-center">
                      <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">Satisfaction</div>
                      <div className="text-gray-600 dark:text-gray-400">4.9/5 Rating</div>
                    </div>
                    <div className="text-center">
                      <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">Excellence</div>
                      <div className="text-gray-600 dark:text-gray-400">Award Winning</div>
                    </div>
                    <div className="text-center">
                      <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">Community</div>
                      <div className="text-gray-600 dark:text-gray-400">Active Forums</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section id="featured-courses" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Featured Courses</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover our most popular courses, carefully curated by industry experts and loved by thousands of students worldwide.
              Start your journey with these trending programs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} featured={true} />
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Explore All Courses</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Browse our comprehensive catalog of courses spanning multiple industries, technologies, and skill levels. 
              Find the perfect course to match your career goals.
            </p>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-blue-200 dark:border-gray-600 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-6 h-6">
                  <Search className="w-full h-full" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses, skills, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border-2 border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 w-6 h-6">
                  <Filter className="w-full h-full" />
                </div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="pl-12 pr-8 py-4 border-2 border-purple-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg min-w-[180px] transition-all duration-300"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
              <span className="text-sm">Showing {filteredCourses.length} courses</span>
            </div>
          </div>

          {/* All Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Ready to Transform Your Life?
              </span>
            </h2>
            <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of learners who have already started their journey to success with Arivom Learning. 
              Your future starts with a single click.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-6 rounded-full text-xl font-bold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl inline-flex items-center justify-center space-x-3"
              >
                <Play className="w-6 h-6" />
                <span>Start Learning Today</span>
                <ArrowRight className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('featured-courses')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 backdrop-blur-sm text-white px-10 py-6 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/30"
              >
                Explore Courses
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
        onCourseSelect={handleCourseSelect}
        courses={courses}
      />
    </div>
  );
};

export default HomePage;
