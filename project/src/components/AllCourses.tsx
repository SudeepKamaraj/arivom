import React, { useEffect, useState } from 'react';
import { useCourses } from '../contexts/CourseContext';
import { Search, Filter, Clock, Users, Star, BookOpen, DollarSign, Grid, List, ArrowRight, Play, TrendingUp, Sparkles, Target } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface AllCoursesProps {
  onCourseSelect: (course: any) => void;
}

const AllCourses: React.FC<AllCoursesProps> = ({ onCourseSelect }) => {
  const { courses } = useCourses();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceFilter, setPriceFilter] = useState('All');

  const categories = ['All', 'Web Development', 'Data Science', 'Mobile Development', 'Design', 'Cloud Computing', 'AI/ML'];

  // Initialize search from query string (?q=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [location.search]);

  const filteredAndSortedCourses = courses
        .filter(course => {
      const matchesSearch = (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (course.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (course.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
      const matchesCategory = categoryFilter === 'All' || 
                             (course.skills || []).some(skill => 
                               categoryFilter === 'Web Development' && ['JavaScript', 'React', 'Angular', 'Vue', 'Node.js', 'HTML', 'CSS'].includes(skill) ||
                               categoryFilter === 'Data Science' && ['Python', 'Data Science', 'Machine Learning', 'SQL'].includes(skill) ||
                               categoryFilter === 'Mobile Development' && ['Flutter', 'React Native', 'iOS', 'Android'].includes(skill) ||
                               categoryFilter === 'Design' && ['UI Design', 'UX Design', 'Design', 'Figma'].includes(skill) ||
                               categoryFilter === 'Cloud Computing' && ['Cloud Computing', 'AWS', 'Azure', 'DevOps'].includes(skill) ||
                               categoryFilter === 'AI/ML' && ['AI', 'Machine Learning', 'Deep Learning'].includes(skill)
                             );
      const matchesPrice = priceFilter === 'All' || 
                          (priceFilter === 'Free' && (!course.price || course.price === 0)) ||
                          (priceFilter === 'Paid' && course.price > 0) ||
                          (priceFilter === 'Under500' && course.price < 500) ||
                          (priceFilter === '500to2000' && course.price >= 500 && course.price <= 2000) ||
                          (priceFilter === 'Above2000' && course.price > 2000);
      return matchesSearch && matchesLevel && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.students || 0) - (a.students || 0);
        case 'rating':
          const aRating = typeof a.rating === 'object' ? a.rating?.average || 0 : a.rating || 0;
          const bRating = typeof b.rating === 'object' ? b.rating?.average || 0 : b.rating || 0;
          return bRating - aRating;
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'newest':
          return (b.id || '').localeCompare(a.id || '');
        default:
          return 0;
      }
    });

  const CourseCard: React.FC<{ course: any }> = ({ course }) => (
    <div
      onClick={() => onCourseSelect(course)}
      className="group relative bg-gradient-to-br from-white to-cyan-50/50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-cyan-900/20 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer overflow-hidden border border-cyan-100/50 dark:border-cyan-800/30 hover:scale-105 hover:-translate-y-3 hover:border-cyan-300"
    >
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative">
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            src={course.thumbnail || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200'}
            alt={course.title}
            className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Animated Play Button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-5 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
              <Play className="w-10 h-10 text-cyan-600" />
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
          
          {/* Price Badge */}
          <div className="absolute top-6 right-6">
            {course.price > 0 ? (
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2 rounded-full flex items-center text-sm font-bold shadow-xl">
                <span>₹{course.price}</span>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-xl">
                FREE
              </div>
            )}
          </div>
          
          {/* Trending Badge for Popular Courses */}
          {course.students && course.students > 1000 && (
            <div className="absolute bottom-6 left-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full flex items-center text-xs font-bold shadow-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>TRENDING</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-8">
          <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-base mb-6 line-clamp-3 leading-relaxed">
            {course.description}
          </p>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:bg-cyan-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-cyan-100 group-hover:to-blue-100 dark:group-hover:bg-cyan-900/30 transition-all duration-300 border border-cyan-100/50">
              <Clock className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{course.duration || '1h'}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-purple-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100 dark:group-hover:bg-purple-900/30 transition-all duration-300 border border-purple-100/50">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-purple-700 dark:text-purple-300">{course.students ? course.students.toLocaleString() : '5'}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:bg-yellow-900/20 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-amber-100 group-hover:to-yellow-100 dark:group-hover:bg-yellow-900/30 transition-all duration-300 border border-amber-100/50">
              <Star className="w-6 h-6 text-amber-500 mx-auto mb-2 fill-amber-500" />
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
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 group-hover:scale-105 ${
                  index === 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
                  index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                  'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                }`}
              >
                {skill}
              </span>
            ))}
            {course.skills && course.skills.length > 3 && (
              <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-semibold">
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
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(course.rating.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">({course.rating.count})</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
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
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl transform scale-110"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Discover Amazing</span>
              <span className="block bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">Learning Experiences</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Explore {filteredAndSortedCourses.length} expertly crafted courses designed to accelerate your career and expand your horizons
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">{filteredAndSortedCourses.length}</div>
                <div className="text-blue-200 text-sm">Total Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">{categories.length - 1}</div>
                <div className="text-blue-200 text-sm">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent">Expert</div>
                <div className="text-blue-200 text-sm">Instructors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Filters */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 mb-12 -mt-16 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Advanced Search */}
            <div className="lg:col-span-2 relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 group-hover:text-purple-500 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search courses, skills, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border-2 border-blue-200 hover:border-purple-300 focus:border-purple-500 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none"></div>
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500 group-hover:text-purple-500 transition-colors">
                <Target className="w-5 h-5" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 border-2 border-indigo-200 hover:border-purple-300 focus:border-purple-500 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-lg transition-all duration-300 appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 group-hover:text-purple-500 transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 border-2 border-green-200 hover:border-purple-300 focus:border-purple-500 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-lg transition-all duration-300 appearance-none"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500 group-hover:text-purple-500 transition-colors">
                <DollarSign className="w-5 h-5" />
              </div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 border-2 border-yellow-200 hover:border-purple-300 focus:border-purple-500 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-lg transition-all duration-300 appearance-none"
              >
                <option value="All">All Prices</option>
                <option value="Free">Free Courses</option>
                <option value="Paid">Paid Courses</option>
                <option value="Under500">Under ₹500</option>
                <option value="500to2000">₹500 - ₹2000</option>
                <option value="Above2000">Above ₹2000</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 group-hover:text-pink-500 transition-colors">
                <Filter className="w-5 h-5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-12 pr-10 py-4 border-2 border-purple-200 hover:border-pink-300 focus:border-pink-500 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-lg transition-all duration-300 appearance-none"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Filter Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  Search: "{searchTerm}"
                </span>
              )}
              {categoryFilter !== 'All' && (
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                  Category: {categoryFilter}
                </span>
              )}
              {levelFilter !== 'All' && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  Level: {levelFilter}
                </span>
              )}
              {priceFilter !== 'All' && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                  Price: {priceFilter}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Course Grid/List */}
        {filteredAndSortedCourses.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-6'
          } transition-all duration-500`}>
            {filteredAndSortedCourses.map((course, index) => (
              <div 
                key={course.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-16 h-16 text-purple-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              We couldn't find any courses matching your criteria. Try adjusting your search or filter options.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('All');
                  setLevelFilter('All');
                  setPriceFilter('All');
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Load More / Pagination could go here */}
        {filteredAndSortedCourses.length > 12 && (
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center space-x-2 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer">
              <span>Load More Courses</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;