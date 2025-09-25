import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { ArrowLeft, Clock, Users, Star, Award, Play, CheckCircle, Lock, CreditCard, DollarSign, Brain, Calendar } from 'lucide-react';
import ReviewSection from './ReviewSection';
import PaymentModal from './PaymentModal';
import LearningCompanion from './LearningCompanion';
import SmartStudyPlanner from './SmartStudyPlanner';
import paymentService from '../services/paymentService';

interface CourseDetailProps {
  course: any;
  onLessonSelect: (lesson: any) => void;
  onAssessmentStart: () => void;
  onAssessmentComplete?: (passed: boolean) => void;
  onBack: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  onLessonSelect,
  onAssessmentStart,
  onAssessmentComplete,
  onBack
}) => {
  const { user } = useAuth();
  const { getCourseProgress, getLastLessonId } = useCourses();
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  // Add this prop to force refresh review eligibility after assessment
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [justCompletedAssessment, setJustCompletedAssessment] = useState(false);
  
  // Payment related state
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Calculate progress and completion status
  useEffect(() => {
    if (!course || !user) return;

    // Check for query parameters from checkout redirect
    const urlParams = new URLSearchParams(location.search);
    const message = urlParams.get('message');
    const paymentSuccess = urlParams.get('payment');
    
    if (message === 'already-enrolled') {
      setShowMessage('already-enrolled');
      // Clear the URL parameter
      navigate(location.pathname, { replace: true });
    } else if (message === 'free-course') {
      setShowMessage('free-course');
      navigate(location.pathname, { replace: true });
    } else if (paymentSuccess === 'success') {
      setShowMessage('payment-success');
      navigate(location.pathname, { replace: true });
    }

    // Auto-hide message after 5 seconds
    if (showMessage) {
      const timer = setTimeout(() => setShowMessage(null), 5000);
      return () => clearTimeout(timer);
    }

    const courseId = (course as any)._id || course.id;
    const userId = (user as any).id || (user as any)._id;
    
    // Get progress from context
    const currentProgress = getCourseProgress(courseId, userId);
    setProgress(currentProgress);
    
    // Course should only be considered "completed" if all videos are watched (100% progress)
    // AND the user has passed the assessment
    const isAllVideosWatched = currentProgress === 100;

    // Check payment status and course access
    const checkCourseAccess = async () => {
      try {
        setPaymentLoading(true);
        
        // First check payment status
        const status = await paymentService.getPaymentStatus(courseId);
        setPaymentStatus(status);
        
        // Determine if user has access
        const hasAccess = status.isFree || status.hasPaid;
        setHasAccess(hasAccess);

        // Only check completion status if user has access
        if (hasAccess) {
          const token = localStorage.getItem('authToken');
          if (token) {
            const response = await fetch(`http://localhost:5001/api/courses/${courseId}/status`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const courseStatus = await response.json();
              // FIXED: A course is only truly completed if the backend confirms completion
              // Backend completion only happens when assessment is passed
              // We also verify all videos are watched (100% progress)
              const backendCompleted = courseStatus.completed;
              
              // Both conditions must be met: backend says completed AND all videos are watched
              const isFullyCompleted = backendCompleted && isAllVideosWatched;
              setIsCompleted(isFullyCompleted);
              
              console.log('Course status:', { 
                backendCompleted,
                isAllVideosWatched,
                finalCompletionStatus: isFullyCompleted
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking course access:', error);
        // SECURITY: On error, default to NO access for paid courses
        // Only allow access if it's clearly a free course (price = 0)
        const isFreeFromPricing = course.price === 0;
        setHasAccess(isFreeFromPricing);
        setPaymentStatus({ 
          isFree: isFreeFromPricing, 
          canAccess: isFreeFromPricing,
          error: true 
        });
        
        // Don't automatically mark as completed for fallback
        // Course completion requires both video progress AND assessment completion
        setIsCompleted(false);
      } finally {
        setPaymentLoading(false);
      }
    };

    checkCourseAccess();

    console.log('Course Detail Debug:', {
      courseId,
      userId,
      currentProgress,
      hasAssessments: course.assessments && course.assessments.length > 0,
      totalLessons: course.lessons?.length || course.videos?.length || 0
    });
  }, [course, user, getCourseProgress]);

  // Handle forced refresh after assessment completion
  useEffect(() => {
    const forceRefresh = sessionStorage.getItem('forceRefreshCourse');
    if (forceRefresh) {
      sessionStorage.removeItem('forceRefreshCourse');
      
      // Immediately check course completion status again
      const recheckCompletion = async () => {
        if (user && course) {
          const courseId = (course as any)._id || course.id;
          const token = localStorage.getItem('authToken');
          
          if (token) {
            try {
              const response = await fetch(`http://localhost:5001/api/courses/${courseId}/status`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok) {
                const courseStatus = await response.json();
                setIsCompleted(courseStatus.completed);
                
                // Also update progress to 100% if completed
                if (courseStatus.completed) {
                  setProgress(100);
                }
              }
            } catch (error) {
              console.error('Error rechecking course completion:', error);
            }
          }
        }
      };
      
      recheckCompletion();
    }
  }, [course, user]);

  if (!course) return null;

  const resolvedUserId = (user as any)?.id || (user as any)?._id || '';
  const lessonProgressKey = `progress_${resolvedUserId}_${(course as any)._id || course.id}`;
  const lessonProgress = JSON.parse(localStorage.getItem(lessonProgressKey) || '{}');

  const lastLessonId = getLastLessonId((course as any)._id || course.id, resolvedUserId);
  const lessons = course.lessons || course.videos || [];
  
  // Debug lesson progress
  console.log('CourseDetail Lesson Progress Debug:', {
    userId: resolvedUserId,
    userObject: user,
    courseId: (course as any)._id || course.id,
    lessonProgressKey,
    lessonProgress,
    allLocalStorageKeys: Object.keys(localStorage).filter(key => key.includes('progress_')),
    lessons: lessons.map((l: any) => ({ id: l._id || l.id, title: l.title }))
  });
  
  const lastLesson = lastLessonId ? lessons.find((l: any) => (l as any)._id === lastLessonId || l.id === lastLessonId) : null;

  // Check if course has assessments
  const hasAssessments = course.assessments && course.assessments.length > 0;
  const totalLessons = lessons.length;
  
  // Get a list of valid lesson IDs to compare against
  const validLessonIds = lessons.map((l: any) => l._id || l.id);
  
  // Only count completed lessons that actually exist in the course
  const completedLessons = Object.keys(lessonProgress)
    .filter(id => validLessonIds.includes(id))
    .length;
    
  // Determine if all videos are completed based on exact lesson count
  const allVideosCompleted = completedLessons >= totalLessons;
  
  // Use both progress calculation and lesson count to determine if assessment should be shown
  // This makes the check more robust
  const shouldShowAssessment = progress >= 100 || allVideosCompleted;

  // Check if user has attempted but not passed the assessment
  const [hasAttemptedAssessment, setHasAttemptedAssessment] = useState(false);

  // Payment success handler
  const handlePaymentSuccess = () => {
    // Refresh payment status after successful payment
    const courseId = (course as any)._id || course.id;
    paymentService.getPaymentStatus(courseId).then(status => {
      setPaymentStatus(status);
      setHasAccess(status.canAccess);
    });
  };

  useEffect(() => {
    const checkAssessmentAttempts = async () => {
      if (!course || !user) return;
      
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const courseId = (course as any)._id || course.id;
          const response = await fetch(`http://localhost:5001/api/assessments/results/course/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const results = await response.json();
            const userId = (user as any)._id || (user as any).id;
            const userResults = results.filter((r: any) => {
              if (!r.userId) return false;
              // Handle both string and object ID comparison
              const resultUserId = typeof r.userId === 'object' ? r.userId._id : r.userId;
              return resultUserId === userId;
            });
            console.log('Assessment results for current user:', userResults);
            setHasAttemptedAssessment(userResults.length > 0);
          }
        }
      } catch (error) {
        console.error('Error checking assessment attempts:', error);
      }
    };
    
    checkAssessmentAttempts();
  }, [course, user]);

  // Comprehensive debug information
  console.log('CourseDetail Debug:', {
    courseId: (course as any)._id || course.id,
    progress,
    isCompleted,
    hasAssessments,
    totalLessons,
    completedLessons,
    allVideosCompleted: completedLessons >= totalLessons,
    shouldShowAssessment,
    hasAttemptedAssessment,
    hasAccess,
    assessmentButtonVisible: hasAccess && (completedLessons >= totalLessons || progress >= 100),
    validLessonIds: lessons.map((l: any) => l._id || l.id),
    lessons: lessons.map((l: any) => ({ 
      id: l._id || l.id, 
      title: l.title, 
      completed: !!lessonProgress[l._id || l.id],
      inProgressMap: !!lessonProgress[l._id || l.id]
    })),
    lessonProgress,
    lessonProgressKeys: Object.keys(lessonProgress)
  });

  // This effect will run when the component re-renders
  // We'll use it to handle any updates needed when returning from assessment
  useEffect(() => {
    // If we're marked as completed, force-refresh the review section
    if (isCompleted) {
      setReviewRefreshKey(prev => prev + 1);
      // Check if this is a recent completion (user just returned from assessment)
      const wasJustCompleted = sessionStorage.getItem('assessmentJustCompleted');
      if (wasJustCompleted) {
        setJustCompletedAssessment(true);
        sessionStorage.removeItem('assessmentJustCompleted');
        // Show completion message briefly
        setShowMessage('🎉 Congratulations! You have successfully completed the course!');
        setTimeout(() => {
          setShowMessage(null);
          setJustCompletedAssessment(false);
        }, 5000);
      }
    }
  }, [isCompleted]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-isabelline min-h-screen">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-dark-gunmetal hover:text-cyber-grape mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Success Messages */}
      {showMessage && (
        <div className="mb-6">
          {showMessage === 'payment-success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                  <p className="text-green-700">You now have full access to this course. Happy learning!</p>
                </div>
              </div>
            </div>
          )}
          
          {showMessage === 'already-enrolled' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Already Enrolled</h3>
                  <p className="text-blue-700">You already have access to this course. Continue your learning!</p>
                </div>
              </div>
            </div>
          )}
          
          {showMessage === 'free-course' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Award className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Free Course Access</h3>
                  <p className="text-blue-700">This is a free course. Enjoy unlimited access!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  course.level === 'Beginner' ? 'bg-caribbean-green/20 text-caribbean-green' :
                  course.level === 'Intermediate' ? 'bg-persimmon/20 text-persimmon' :
                  'bg-cyber-grape/20 text-cyber-grape'
                }`}>
                  {course.level}
                </span>
                <div className="flex items-center space-x-4">
                  {course.price > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-dark-gunmetal">
                        {paymentService.formatCurrency(course.price)}
                      </div>
                      {paymentStatus?.hasPaid && (
                        <div className="text-sm text-caribbean-green font-medium">Purchased</div>
                      )}
                    </div>
                  )}
                  {course.price === 0 && (
                    <div className="px-3 py-1 bg-caribbean-green/20 text-caribbean-green rounded-full text-sm font-semibold">
                      Free
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-caribbean-green">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-dark-gunmetal mb-4">
                {course.title}
              </h1>

              <p className="text-dark-gunmetal/70 mb-6 leading-relaxed">
                {course.description}
              </p>



              <div className="flex flex-wrap items-center gap-6 text-sm text-dark-gunmetal/70 mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-persimmon text-persimmon" />
                  <span>{course.rating} rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Certificate included</span>
                </div>
              </div>

              <div className="bg-isabelline rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-dark-gunmetal">Course Progress</span>
                  <span className={`text-sm font-semibold ${isCompleted ? 'text-green-600' : 'text-dark-gunmetal'}`}>
                    {isCompleted ? 'Completed ✅' : `${progress}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-cyber-grape'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {lastLesson && !isCompleted && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-dark-gunmetal/70">Last lesson: <span className="font-medium">{lastLesson.title}</span></span>
                    <button
                      onClick={() => onLessonSelect(lastLesson)}
                      className="px-3 py-1.5 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                )}
                {isCompleted && (
                  <div className="mt-4">
                    <div className={`flex items-center justify-between p-4 rounded-lg transition-all duration-500 ${
                      justCompletedAssessment 
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 shadow-lg' 
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          justCompletedAssessment ? 'bg-green-500 animate-pulse' : 'bg-green-500'
                        }`}>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-lg font-bold text-green-700">Course Completed!</span>
                          <p className="text-sm text-green-600">You've successfully finished all lessons and passed the assessment</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Back to Dashboard
                        </button>
                      </div>
                    </div>
                    {justCompletedAssessment && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Next Steps:</span>
                        </div>
                        <ul className="mt-2 text-sm text-blue-600 space-y-1">
                          <li>• Download your certificate from the dashboard</li>
                          <li>• Leave a review to help other students</li>
                          <li>• Explore more courses to continue learning</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-dark-gunmetal mb-3">Skills You'll Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-cyber-grape/10 text-cyber-grape text-sm rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructor section removed */}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Access Control / Payment */}
          {!paymentLoading && !hasAccess && course.price > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-dark-gunmetal mb-2">
                    {paymentService.formatCurrency(course.price)}
                  </div>
                  <p className="text-dark-gunmetal/70">One-time payment</p>
                </div>
                
                <button
                  onClick={() => navigate(`/checkout/${course._id || course.id}`)}
                  className="w-full bg-cyber-grape hover:bg-cyber-grape-dark text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 mb-4"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Purchase Course</span>
                </button>
                
                <div className="text-xs text-dark-gunmetal/60">
                  <p>✓ Lifetime access</p>
                  <p>✓ Certificate of completion</p>
                  <p>✓ All course materials</p>
                </div>
              </div>
            </div>
          )}

          {/* Already Enrolled Message */}
          {!paymentLoading && hasAccess && course.price > 0 && paymentStatus?.hasPaid && (
            <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
              <div className="text-center">
                <div className="mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Already Enrolled!</h3>
                  <p className="text-green-700">You have full access to this course</p>
                </div>
                
                <div className="text-sm text-green-600 space-y-1">
                  <p>✓ Payment completed</p>
                  <p>✓ Lifetime access activated</p>
                  <p>✓ All features unlocked</p>
                </div>
              </div>
            </div>
          )}

          {/* Free Course Message */}
          {!paymentLoading && hasAccess && course.price === 0 && (
            <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="text-center">
                <div className="mb-4">
                  <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-blue-800 mb-2">Free Course</h3>
                  <p className="text-blue-700">Enjoy this course at no cost!</p>
                </div>
                
                <div className="text-sm text-blue-600 space-y-1">
                  <p>✓ Full access included</p>
                  <p>✓ Certificate available</p>
                  <p>✓ All materials included</p>
                </div>
              </div>
            </div>
          )}

          {/* Access Denied Message */}
          {!paymentLoading && !hasAccess && course.price > 0 && (
            <div className="bg-persimmon/10 border border-persimmon/20 rounded-xl p-6 text-center">
              <Lock className="w-8 h-8 text-persimmon mx-auto mb-4" />
              <h3 className="font-semibold text-persimmon mb-2">Course Locked</h3>
              <p className="text-persimmon/80 text-sm">
                Purchase this course to access all lessons and materials.
              </p>
            </div>
          )}

          {/* Curriculum */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-dark-gunmetal mb-4">
              Course Content ({course.lessons.length} lessons)
            </h3>
            
            <div className="space-y-3">
              {course.lessons.map((lesson: any, index: number) => {
                const lessonId = (lesson as any)._id || lesson.id;
                const prevLesson = index > 0 ? course.lessons[index - 1] : null;
                const prevLessonId = prevLesson ? ((prevLesson as any)._id || prevLesson.id) : null;
                const isLessonCompleted = lessonProgress[lessonId];
                const isFirstLesson = index === 0;
                const prevLessonCompleted = prevLessonId ? lessonProgress[prevLessonId] : false;
                
                // Access logic: user must have course access (paid or free) and meet lesson prerequisites
                const canAccess = hasAccess && (isFirstLesson || prevLessonCompleted);
                
                return (
                  <div
                    key={lesson.id}
                    onClick={() => canAccess && onLessonSelect(lesson)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      canAccess
                        ? 'cursor-pointer hover:bg-isabelline border-gray-200'
                        : 'cursor-not-allowed opacity-60 border-gray-100'
                    } ${
                      isLessonCompleted
                        ? 'bg-caribbean-green/10 border-caribbean-green/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {!hasAccess || (!isFirstLesson && !prevLessonCompleted) ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : isLessonCompleted ? (
                        <CheckCircle className="w-5 h-5 text-caribbean-green" />
                      ) : (
                        <Play className="w-5 h-5 text-cyber-grape" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          isLessonCompleted ? 'text-caribbean-green' : 'text-dark-gunmetal'
                        }`}>
                          {lesson.title}
                        </p>
                        <p className="text-sm text-dark-gunmetal/70">
                          {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment Button - Show if videos are completed OR progress is 100% */}
            {hasAccess && (completedLessons >= totalLessons || progress >= 100) && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-cyber-grape/10 border border-cyber-grape/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-cyber-grape mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">All lessons completed!</span>
                  </div>
                  <p className="text-sm text-cyber-grape/80">
                    {isCompleted 
                      ? `You've successfully completed this course with all videos watched and assessment passed. You can take the assessment again anytime.`
                      : hasAssessments 
                        ? `You've watched all ${totalLessons} lessons. Click below to take the final assessment to complete the course and earn your certificate.`
                        : `You've watched all ${totalLessons} lessons. Click below to complete the course and earn your certificate.`
                    }
                  </p>
                  {hasAttemptedAssessment && !isCompleted && (
                    <p className="text-sm text-persimmon mt-2">
                      You need to pass the assessment to complete this course and unlock the review option.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    console.log('Starting assessment...', {
                      courseId: (course as any)._id || course.id,
                      progress,
                      completedLessons,
                      totalLessons
                    });
                    // Always start assessment after completing all videos
                    onAssessmentStart();
                    // Assessment completion will be handled via the callback
                  }}
                  className="w-full bg-cyber-grape hover:bg-cyber-grape-dark text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <Award className="w-5 h-5" />
                  <span>
                    {isCompleted 
                      ? 'Retake Assessment' 
                      : hasAttemptedAssessment 
                        ? 'Retake Assessment' 
                        : 'Take Assessment'
                    }
                  </span>
                </button>
              </div>
            )}

            {hasAccess && isCompleted && !shouldShowAssessment && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center text-caribbean-green">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Course Completed!</p>
                  <p className="text-sm text-caribbean-green/80 mt-1">Certificate earned</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unique Features Row */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* AI Learning Companion */}
        <LearningCompanion 
          courseId={(course as any)._id || course.id}
          className="h-fit"
        />
        
        {/* Smart Study Planner */}
        <SmartStudyPlanner 
          courseId={(course as any)._id || course.id}
          className="h-fit"
        />
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <ReviewSection
          key={reviewRefreshKey}
          courseId={(course as any)._id || course.id}
          courseTitle={course.title}
        />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CourseDetail;
