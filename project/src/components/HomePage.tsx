import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { useNavigate } from 'react-router-dom';
import { Users, Award, TrendingUp, Star, Clock, Search, Filter, ArrowRight, Play, CheckCircle } from 'lucide-react';
import AuthModal from './AuthModal';
import ArivomLogo from './ArivomLogo';

interface HomePageProps {
  onCourseSelect: (course: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCourseSelect }) => {
  const { user } = useAuth();
  const { courses, getRecommendedCourses } = useCourses();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const featuredCourses = courses.slice(0, 6);
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleCourseSelect = (course: any) => {
    if (!user) {
      setShowAuthModal(true);
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
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100 dark:border-gray-800 ${
        featured ? 'transform hover:scale-105' : ''
      }`}
    >
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.level === 'Beginner' ? 'bg-caribbean-green/20 text-caribbean-green' :
            course.level === 'Intermediate' ? 'bg-persimmon/20 text-persimmon' :
            'bg-cyber-grape/20 text-cyber-grape'
          }`}>
            {course.level}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-sm font-semibold text-dark-gunmetal">${course.price}</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg text-dark-gunmetal dark:text-white mb-2 group-hover:text-cyber-grape transition-colors">
          {course.title}
        </h3>
        <p className="text-dark-gunmetal/70 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center space-x-4 text-sm text-dark-gunmetal/70 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-persimmon text-persimmon" />
            <span>{course.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {course.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="px-2 py-1 bg-cyber-grape/10 text-cyber-grape text-xs rounded-lg font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
        
        {/* Instructor removed */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-isabelline dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative bg-cyber-grape text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <ArivomLogo size="lg" variant="full" className="text-white" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight drop-shadow">
              <span className="block">Transform Your Career with</span>
              <span className="block text-white">Expert-Led Courses</span>
            </h2>
            
            <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals advancing their careers with our comprehensive course catalog. 
              Get personalized recommendations, earn certificates, and master in-demand skills.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="bg-white text-cyber-grape px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleNavigate('recommendations')}
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-cyber-grape transition-all"
                  >
                    View Recommendations
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-white text-cyber-grape px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-cyber-grape transition-all"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">50,000+</div>
                <div className="text-cyber-grape/90">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-cyber-grape/90">Expert Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-cyber-grape/90">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-cyber-grape/90">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-gunmetal dark:text-white mb-4">Featured Courses</h2>
            <p className="text-dark-gunmetal/70 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our most popular courses, carefully selected by industry experts and loved by thousands of students.
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
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-gunmetal dark:text-white mb-4">Explore All Courses</h2>
            <p className="text-dark-gunmetal/70 dark:text-gray-300 max-w-2xl mx-auto">
              Browse our complete catalog of courses across various technologies and skill levels.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-isabelline dark:bg-gray-800 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-dark-gunmetal dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-cyber-grape focus:border-cyber-grape"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyber-grape focus:border-cyber-grape bg-white dark:bg-gray-900 text-dark-gunmetal dark:text-gray-100"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
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
        <section className="py-16 bg-cyber-grape text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl mb-8 text-cyber-grape/90">
              Join thousands of professionals who have transformed their careers with our courses.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-cyber-grape px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all inline-flex items-center space-x-2"
            >
              <span>Start Learning Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default HomePage;