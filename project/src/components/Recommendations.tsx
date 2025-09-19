import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { TrendingUp, Star, Clock, Users, BookOpen, Target, Zap } from 'lucide-react';

interface RecommendationsProps {
  onCourseSelect: (course: any) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ onCourseSelect }) => {
  const { user } = useAuth();
  const { courses, getRecommendedCourses } = useCourses();

  // Read saved preferences
  const interests = (typeof window !== 'undefined' ? localStorage.getItem('user_interests') : '') || '';
  const careerObjective = (typeof window !== 'undefined' ? localStorage.getItem('user_career_objective') : '') || '';

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

  // Simplified recommendations based on course popularity and level
  const recommendedCourses = courses
    .sort((a, b) => (b.rating * b.students) - (a.rating * a.students))
    .slice(0, 6);

  const skillBasedCourses = courses
    .filter(course => user.skills && user.skills.length > 0 && 
      course.skills.some(skill => user.skills.includes(skill)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const beginnerCourses = courses
    .filter(course => course.level === 'Beginner')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const trendingCourses = courses
    .filter(course => course.students > 10000)
    .sort((a, b) => b.students - a.students)
    .slice(0, 4);

  const CourseCard: React.FC<{ course: any; reason?: string }> = ({ course, reason }) => (
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
        {reason && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            {reason}
          </div>
        )}
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
            <span>{course.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {course.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className={`px-2 py-1 text-xs rounded-lg font-medium ${
                user.skills?.includes(skill)
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-gray-700 font-medium text-sm">
            by {course.instructor}
          </p>
          <span className="text-lg font-bold text-gray-900">${course.price}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Personalized Recommendations
        </h1>
        <p className="text-gray-600">
          Courses tailored to your skills and learning goals
        </p>
      </div>

      {/* User Skills Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Your Skills</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.skills?.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium border border-blue-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Top Recommendations */}
      <section className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Top Picks for You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.slice(0, 6).map((course) => (
            <CourseCard key={course.id} course={course} reason="Recommended" />
          ))}
        </div>
      </section>

      {/* Skill-Based Recommendations */}
      <section className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Based on Your Skills</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillBasedCourses.slice(0, 6).map((course) => (
            <CourseCard key={course.id} course={course} reason="Skill Match" />
          ))}
        </div>
      </section>

      {/* Trending Courses */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCourses.map((course) => (
            <CourseCard key={course.id} course={course} reason="Trending" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Recommendations;