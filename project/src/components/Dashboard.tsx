import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses, Course } from '../contexts/CourseContext';
import { BookOpen, Clock, Award, TrendingUp, Search, Filter, Play, CheckCircle, Star, ArrowRight, CreditCard, DollarSign } from 'lucide-react';
import paymentService from '../services/paymentService';

interface DashboardProps {
  onCourseSelect?: (course: Course) => void;
  onViewCertificate?: (course: Course) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCourseSelect, onViewCertificate }) => {
  const { user } = useAuth();
  const { courses, getCourseProgress, isCourseCompleted } = useCourses();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<{ [courseId: string]: any }>({});

  // Filter courses based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course: Course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  // Load payment statuses for all courses
  useEffect(() => {
    const loadPaymentStatuses = async () => {
      if (!user || courses.length === 0) return;

      const statuses: { [courseId: string]: any } = {};
      
      for (const course of courses) {
        const courseId = (course as any)._id || course.id;
        try {
          const status = await paymentService.getPaymentStatus(courseId);
          statuses[courseId] = status;
        } catch (error) {
          console.error(`Error loading payment status for course ${courseId}:`, error);
          // Default to free course status on error
          statuses[courseId] = { isFree: true, hasPaid: false, canAccess: true };
        }
      }
      
      setPaymentStatuses(statuses);
    };

    loadPaymentStatuses();
  }, [user, courses]);

  // Get courses with actual progress data and payment status
  const getCoursesWithProgress = () => {
    if (!user) return { inProgress: [], completed: [], recommended: [], purchased: [], free: [] };

    const userId = (user as any).id || (user as any)._id;
    
    const coursesWithProgress = courses.map(course => {
      const courseId = (course as any)._id || course.id;
      const progress = getCourseProgress(courseId, userId);
      const completed = isCourseCompleted(courseId, userId);
      const paymentStatus = paymentStatuses[courseId];
      
      return {
        ...course,
        progress,
        completed,
        courseId,
        paymentStatus
      };
    });

    const inProgress = coursesWithProgress.filter(course => 
      course.progress > 0 && course.progress < 100 && !course.completed
    );

    const completed = coursesWithProgress.filter(course => 
      course.completed || course.progress === 100
    );

    const recommended = coursesWithProgress.filter(course => 
      course.progress === 0 && !course.completed
    ).slice(0, 6);

    // Separate paid courses from free courses
    const purchased = coursesWithProgress.filter(course => 
      course.paymentStatus?.hasPaid && !course.paymentStatus?.isFree
    );

    const free = coursesWithProgress.filter(course => 
      course.paymentStatus?.isFree || (course.price === 0)
    );

    return { inProgress, completed, recommended, purchased, free };
  };

  // Check MongoDB completion status for all courses
  useEffect(() => {
    const checkMongoDBStatus = async () => {
      if (!user) return;
      
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        // Check completion status for each course
        for (const course of courses) {
          const courseId = (course as any)._id || course.id;
          try {
            const response = await fetch(`http://localhost:5001/api/courses/${courseId}/status`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const status = await response.json();
              console.log(`Course ${courseId} MongoDB status:`, status);
            }
          } catch (error) {
            console.error(`Error checking status for course ${courseId}:`, error);
          }
        }
      } catch (error) {
        console.error('Error checking MongoDB status:', error);
      }
    };

    checkMongoDBStatus();
  }, [courses, user]);

  const { inProgress, completed, recommended, purchased, free } = getCoursesWithProgress();

  if (!user) {
    return (
      <div className="min-h-screen bg-isabelline flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-gunmetal mb-4">Please log in to view your dashboard</h2>
          <p className="text-dark-gunmetal/70">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  const handleCourseClick = (course: Course) => {
    if (onCourseSelect) {
      onCourseSelect(course);
    }
  };

  const handleViewCertificate = (course: Course) => {
    if (onViewCertificate) {
      onViewCertificate(course);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'in-progress', label: 'In Progress', icon: Clock, count: inProgress.length },
    { id: 'completed', label: 'Completed', icon: CheckCircle, count: completed.length },
    { id: 'purchased', label: 'Purchased', icon: CreditCard, count: purchased.length },
    { id: 'recommended', label: 'Recommended', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-isabelline dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-gunmetal dark:text-white">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-dark-gunmetal/70 dark:text-gray-300 mt-1">
                Continue your learning journey and track your progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyber-grape rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* User Profile Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-cyber-grape/10 dark:bg-cyber-grape/20 rounded-lg p-4">
              <h3 className="font-semibold text-cyber-grape mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-cyber-grape/20 text-cyber-grape text-xs rounded-md">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-cyber-grape text-sm">No skills added yet</p>
                )}
              </div>
            </div>
            
            <div className="bg-caribbean-green/10 dark:bg-caribbean-green/20 rounded-lg p-4">
              <h3 className="font-semibold text-caribbean-green mb-2">Interests</h3>
              <p className="text-caribbean-green text-sm">
                {user.interests || 'No interests specified'}
              </p>
            </div>
            
            <div className="bg-persimmon/10 dark:bg-persimmon/20 rounded-lg p-4">
              <h3 className="font-semibold text-persimmon mb-2">Career Objective</h3>
              <p className="text-persimmon text-sm">
                {user.careerObjective || 'No career objective set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark-gunmetal dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-cyber-grape focus:border-cyber-grape"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-cyber-grape text-cyber-grape'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Progress Summary */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-semibold text-dark-gunmetal dark:text-white mb-4">Your Learning Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyber-grape/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-cyber-grape" />
                    </div>
                    <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-1">In Progress</h4>
                    <p className="text-2xl font-bold text-cyber-grape">{inProgress.length}</p>
                    <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300">courses</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-caribbean-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-caribbean-green" />
                    </div>
                    <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-1">Completed</h4>
                    <p className="text-2xl font-bold text-caribbean-green">{completed.length}</p>
                    <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300">courses</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-persimmon/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-8 h-8 text-persimmon" />
                    </div>
                    <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-1">Recommended</h4>
                    <p className="text-2xl font-bold text-persimmon">{recommended.length}</p>
                    <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300">courses</p>
                  </div>
                </div>
              </div>

              {/* In Progress Courses */}
              {inProgress.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-dark-gunmetal dark:text-white mb-4">Continue Learning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inProgress.slice(0, 2).map((course: any) => (
                      <div key={course.courseId} className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-cyber-grape">{course.level}</span>
                            {course.paymentStatus?.hasPaid && !course.paymentStatus?.isFree && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Purchased
                              </span>
                            )}
                            {course.paymentStatus?.isFree && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                Free
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.duration}</span>
                        </div>
                        <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-2">{course.title}</h4>
                        <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-4">{course.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-caribbean-green h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-persimmon fill-current" />
                            <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.rating}</span>
                          </div>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors">
                            <Play className="w-4 h-4" />
                            <span>Continue</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Courses */}
              {recommended.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-dark-gunmetal dark:text-white mb-4">Recommended for You</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommended.slice(0, 3).map((course: Course) => (
                      <div key={course.id} className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-cyber-grape">{course.level}</span>
                          <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.duration}</span>
                        </div>
                        <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-2">{course.title}</h4>
                        <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-4">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-persimmon fill-current" />
                            <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.rating}</span>
                          </div>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-caribbean-green hover:bg-caribbean-green-dark text-white rounded-lg transition-colors">
                            <ArrowRight className="w-4 h-4" />
                            <span>Start</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* In Progress Tab */}
          {activeTab === 'in-progress' && (
            <div>
              <h3 className="text-xl font-semibold text-dark-gunmetal dark:text-white mb-4">Courses in Progress</h3>
              {inProgress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inProgress.map((course: any) => (
                    <div key={course.courseId} className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-cyber-grape">{course.level}</span>
                        <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.duration}</span>
                      </div>
                      <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-2">{course.title}</h4>
                      <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-4">{course.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-caribbean-green h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-persimmon fill-current" />
                          <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.rating}</span>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors">
                          <Play className="w-4 h-4" />
                          <span>Continue Learning</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-dark-gunmetal/70 dark:text-gray-300 mb-4">No courses in progress. Start learning to see your progress!</p>
                  <button 
                    onClick={() => setActiveTab('recommended')}
                    className="px-4 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <div>
              <h3 className="text-xl font-semibold text-dark-gunmetal dark:text-white mb-4">Completed Courses</h3>
              {completed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completed.map((course: any) => (
                    <div key={course.courseId} className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-caribbean-green">{course.level}</span>
                        <div className="flex items-center space-x-2 text-caribbean-green">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-2">{course.title}</h4>
                      <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-4">{course.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-persimmon fill-current" />
                          <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.rating}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCertificate(course);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-caribbean-green hover:bg-caribbean-green-dark text-white rounded-lg transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          <span>View Certificate</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-dark-gunmetal/70 dark:text-gray-300 mb-4">No completed courses yet. Keep learning to earn certificates!</p>
                  <button 
                    onClick={() => setActiveTab('in-progress')}
                    className="px-4 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors"
                  >
                    Continue Learning
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Purchased Tab */}
          {activeTab === 'purchased' && (
            <div>
              {purchased.length > 0 ? (
                <>
                  <h3 className="text-xl font-semibold text-dark-gunmetal dark:text-white mb-4">
                    Your Purchased Courses ({purchased.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchased.map((course: any) => (
                      <div key={course.courseId} className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-cyber-grape">{course.level}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center">
                              <CreditCard className="w-3 h-3 mr-1" />
                              Purchased
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-dark-gunmetal dark:text-white">
                              {paymentService.formatCurrency(course.price)}
                            </div>
                            <div className="text-xs text-green-600">Paid</div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-2">{course.title}</h4>
                        <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-4">{course.description}</p>
                        
                        {/* Progress Bar for purchased courses */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-caribbean-green h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-persimmon fill-current" />
                            <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.rating}</span>
                          </div>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors">
                            {course.progress > 0 ? (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Continue</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Start</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-gunmetal dark:text-white mb-2">No Purchased Courses</h3>
                  <p className="text-dark-gunmetal/70 dark:text-gray-300 mb-4">
                    You haven't purchased any courses yet. Browse our catalog to find courses that interest you.
                  </p>
                  <button
                    onClick={() => setActiveTab('recommended')}
                    className="px-6 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recommended Tab */}
          {activeTab === 'recommended' && (
            <div>
              <h3 className="text-xl font-semibold text-dark-gunmetal dark:text-white mb-4">Recommended Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCourses.slice(0, 6).map((course: Course) => (
                  <div key={course.id} className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-cyber-grape">{course.level}</span>
                      <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.duration}</span>
                    </div>
                    <h4 className="font-semibold text-dark-gunmetal dark:text-white mb-2">{course.title}</h4>
                    <p className="text-sm text-dark-gunmetal/70 dark:text-gray-300 mb-4">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-persimmon fill-current" />
                        <span className="text-sm text-dark-gunmetal/70 dark:text-gray-300">{course.rating}</span>
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-caribbean-green hover:bg-caribbean-green-dark text-white rounded-lg transition-colors">
                        <ArrowRight className="w-4 h-4" />
                        <span>Start Learning</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;