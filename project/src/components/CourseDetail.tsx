import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { ArrowLeft, Clock, Users, Star, Award, Play, CheckCircle, Lock } from 'lucide-react';
import ReviewSection from './ReviewSection';

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
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  // Add this prop to force refresh review eligibility after assessment
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  // Calculate progress and completion status
  useEffect(() => {
    if (!course || !user) return;

    const courseId = (course as any)._id || course.id;
    const userId = (user as any).id || (user as any)._id;
    
    // Get progress from context
    const currentProgress = getCourseProgress(courseId, userId);
    setProgress(currentProgress);

    // Check if course is completed from MongoDB
    const checkCourseStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch(`http://localhost:5000/api/courses/${courseId}/status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const status = await response.json();
            setIsCompleted(status.completed);
            console.log('Course status from MongoDB:', status);
          }
        }
      } catch (error) {
        console.error('Error checking course status:', error);
        // Fallback to localStorage
        const completedCourses = (user as any).completedCourses || [];
        const isCourseCompleted = completedCourses.includes(courseId);
        setIsCompleted(isCourseCompleted);
      }
    };

    checkCourseStatus();

    console.log('Course Detail Debug:', {
      courseId,
      userId,
      currentProgress,
      hasAssessments: course.assessments && course.assessments.length > 0,
      totalLessons: course.lessons?.length || course.videos?.length || 0
    });
  }, [course, user, getCourseProgress]);

  if (!course) return null;

  const resolvedUserId = (user as any)?.id || (user as any)?._id || '';
  const lessonProgressKey = `progress_${resolvedUserId}_${(course as any)._id || course.id}`;
  const lessonProgress = JSON.parse(localStorage.getItem(lessonProgressKey) || '{}');

  const lastLessonId = getLastLessonId((course as any)._id || course.id, user?.id || '');
  const lessons = course.lessons || course.videos || [];
  const lastLesson = lastLessonId ? lessons.find((l: any) => (l as any)._id === lastLessonId || l.id === lastLessonId) : null;

  // Check if course has assessments
  const hasAssessments = course.assessments && course.assessments.length > 0;
  const totalLessons = lessons.length;
  const completedLessons = Object.keys(lessonProgress).length;

  // Always show assessment button if all videos are completed (with or without assessments)
  // Changed to remove the !isCompleted condition so button always appears when videos are complete
  const shouldShowAssessment = progress >= 100;

  // Check if user has attempted but not passed the assessment
  const [hasAttemptedAssessment, setHasAttemptedAssessment] = useState(false);

  useEffect(() => {
    const checkAssessmentAttempts = async () => {
      if (!course || !user) return;
      
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const courseId = (course as any)._id || course.id;
          const response = await fetch(`http://localhost:5000/api/assessments/results/course/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const results = await response.json();
            const userResults = results.filter((r: any) => r.userId._id === user.id);
            setHasAttemptedAssessment(userResults.length > 0);
          }
        }
      } catch (error) {
        console.error('Error checking assessment attempts:', error);
      }
    };
    
    checkAssessmentAttempts();
  }, [course, user]);

  // Debug information
  console.log('CourseDetail Debug:', {
    courseId: (course as any)._id || course.id,
    progress,
    isCompleted,
    hasAssessments,
    totalLessons,
    completedLessons,
    shouldShowAssessment,
    hasAttemptedAssessment,
    lessonProgress
  });

  // This effect will run when the component re-renders
  // We'll use it to handle any updates needed when returning from assessment
  useEffect(() => {
    // If we're marked as completed, force-refresh the review section
    if (isCompleted) {
      setReviewRefreshKey(prev => prev + 1);
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
                {isCompleted && (
                  <div className="flex items-center space-x-2 text-caribbean-green">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
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
                  <span className="text-sm font-semibold text-dark-gunmetal">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-cyber-grape h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {lastLesson && (
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
                const canAccess = index === 0 || (prevLessonId ? lessonProgress[prevLessonId] : false);
                
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
                      {!canAccess ? (
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

            {/* Assessment Button */}
            {shouldShowAssessment && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-cyber-grape/10 border border-cyber-grape/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-cyber-grape mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">All lessons completed!</span>
                  </div>
                  <p className="text-sm text-cyber-grape/80">
                    {isCompleted 
                      ? `You've already completed this course. You can take the assessment again anytime.`
                      : hasAssessments 
                        ? `You've completed all ${totalLessons} lessons. Click below to take the final assessment to earn your certificate.`
                        : `You've completed all ${totalLessons} lessons. Click below to complete the course and earn your certificate.`
                    }
                  </p>
                  {hasAttemptedAssessment && !isCompleted && (
                    <p className="text-sm text-persimmon mt-2">
                      You need to pass the assessment to complete this course and earn your certificate.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    // Always start assessment after completing course
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

            {isCompleted && !shouldShowAssessment && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center text-caribbean-green">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Course Completed!</p>
                  <p className="text-sm text-caribbean-green/80 mt-1">Certificate earned</p>
                </div>
              </div>
            )}

            {/* Debug Info */}
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Progress: {progress}%</p>
              <p>Completed: {completedLessons}/{totalLessons}</p>
              <p>Has Assessments: {hasAssessments ? 'Yes' : 'No'}</p>
              <p>Is Completed: {isCompleted ? 'Yes' : 'No'}</p>
              <p>Show Assessment: {shouldShowAssessment ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <ReviewSection
          key={reviewRefreshKey}
          courseId={(course as any)._id || course.id}
          courseTitle={course.title}
        />
      </div>
    </div>
  );
};

export default CourseDetail;
