import React, { useEffect, useState } from 'react';
import { useCourses } from '../contexts/CourseContext';
import { Search, Filter, Clock, Users, Star, BookOpen, DollarSign } from 'lucide-react';
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
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
      const matchesCategory = categoryFilter === 'All' || 
                             course.skills.some(skill => 
                               categoryFilter === 'Web Development' && ['JavaScript', 'React', 'Node.js', 'Web Development', 'Frontend'].includes(skill) ||
                               categoryFilter === 'Data Science' && ['Python', 'Data Science', 'Machine Learning', 'Analytics'].includes(skill) ||
                               categoryFilter === 'Mobile Development' && ['Mobile Development', 'React Native', 'Flutter'].includes(skill) ||
                               categoryFilter === 'Design' && ['UI Design', 'UX Design', 'Design', 'Figma'].includes(skill) ||
                               categoryFilter === 'Cloud Computing' && ['Cloud Computing', 'AWS', 'Azure', 'DevOps'].includes(skill) ||
                               categoryFilter === 'AI/ML' && ['AI', 'Machine Learning', 'Deep Learning'].includes(skill)
                             );
      return matchesSearch && matchesLevel && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.students - a.students;
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

  const CourseCard: React.FC<{ course: any }> = ({ course }) => (
    <div
      onClick={() => onCourseSelect(course)}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
    >
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {course.level}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          {course.price > 0 ? (
            <div className="flex items-center text-sm font-semibold text-gray-900">
              <DollarSign className="w-3 h-3 mr-1" />
              <span>₹{course.price}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-green-600">Free</span>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>
              {!course.rating || course.rating.count === 0 
                ? 'No ratings yet' 
                : `${course.rating.average}/5 (${course.rating.count})`
              }
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {course.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          All Courses ({filteredAndSortedCourses.length})
        </h1>
        <p className="text-gray-600">
          Explore our complete catalog of expert-led courses
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses and skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredAndSortedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default AllCourses;