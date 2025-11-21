import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { ArrowLeft, Clock, CheckCircle, XCircle, Award, Save, AlertCircle, Star } from 'lucide-react';
import CourseCompletionModal from './CourseCompletionModal';
import { useNavigate } from 'react-router-dom';

interface AssessmentProps {
  course: any;
  onComplete: (passed: boolean) => void;
  onBack: () => void;
}

interface AssessmentResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  answers: number[];
  completedAt: string;
}

const Assessment: React.FC<AssessmentProps> = ({ course, onComplete, onBack }) => {
  const { user } = useAuth();
  const { completeCourse, getCourseProgress } = useCourses();
  const navigate = useNavigate();
  
  // Get questions from course assessments or generate fallback
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);

  useEffect(() => {
    // Load questions from course assessments
    loadAssessmentQuestions();
    
    // Check current course progress
    if (user && course) {
      const courseId = course._id || course.id;
      const userId = (user as any).id || (user as any)._id;
      const currentProgress = getCourseProgress(courseId, userId);
      setCourseProgress(currentProgress);
      console.log('Course progress at assessment time:', currentProgress);
    }
  }, [course, user, getCourseProgress]);

  useEffect(() => {
    if (questions.length > 0) {
      // Initialize answers when questions are loaded
      setCurrentQuestion(0);
      setSelectedAnswers(Array.from({ length: questions.length }));
      setStartTime(Date.now());
      setLoading(false);
      
      // Load saved progress if exists
      loadSavedProgress();
    }
  }, [questions.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadAssessmentQuestions = () => {
    if (!course) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    // Try to get questions from course assessments
    if (course.assessments && course.assessments.length > 0) {
      // Use the first assessment's questions
      const assessment = course.assessments[0];
      if (assessment.questions && assessment.questions.length > 0) {
        setQuestions(assessment.questions);
        return;
      }
    }

    // Fallback: Generate basic questions based on course content
    const fallbackQuestions = generateFallbackQuestions(course);
    setQuestions(fallbackQuestions);
  };

  const generateFallbackQuestions = (course: any) => {
    const courseTitle = course.title || 'this course';
    const skills = course.skills || course.tags || ['programming', 'development'];
    
    return [
      {
        question: `What is the main focus of ${courseTitle}?`,
        options: [
          'Learning practical skills and concepts',
          'Memorizing theoretical information only',
          'Watching videos without practice',
          'Taking notes without understanding'
        ],
        correctAnswer: 0,
        explanation: 'The course focuses on practical learning and skill development.'
      },
      {
        question: `Which of the following best describes the level of ${courseTitle}?`,
        options: [
          course.level || 'Beginner',
          'Advanced Expert',
          'Professional Master',
          'Basic Introduction'
        ],
        correctAnswer: 0,
        explanation: `This course is designed for ${course.level || 'beginner'} level students.`
      },
      {
        question: `What skills will you learn from ${courseTitle}?`,
        options: [
          skills.slice(0, 3).join(', '),
          'No specific skills',
          'Only theoretical knowledge',
          'Basic computer usage'
        ],
        correctAnswer: 0,
        explanation: `The course covers: ${skills.join(', ')}`
      },
      {
        question: `How should you approach learning in ${courseTitle}?`,
        options: [
          'Practice regularly and complete all exercises',
          'Skip the practical parts',
          'Only watch the videos',
          'Rush through without understanding'
        ],
        correctAnswer: 0,
        explanation: 'Regular practice and completing exercises is essential for learning.'
      },
      {
        question: `What is the best way to get help if you're stuck in ${courseTitle}?`,
        options: [
          'Review the material and try different approaches',
          'Give up immediately',
          'Skip to the next lesson',
          'Ignore the problem'
        ],
        correctAnswer: 0,
        explanation: 'Reviewing material and trying different approaches helps with understanding.'
      }
    ];
  };

  const loadSavedProgress = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const courseId = course?._id || course?.id;
      if (!courseId) return;

      const response = await fetch(`http://localhost:5001/api/assessments/progress/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setSelectedAnswers(data.progress.answers || []);
          setCurrentQuestion(data.progress.currentQuestion || 0);
          setTimeLeft(data.progress.timeLeft || 1800);
          setSavedProgress(true);
        }
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const courseId = course?._id || course?.id;
      if (!courseId) return;

      await fetch(`http://localhost:5001/api/assessments/progress/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: selectedAnswers,
          currentQuestion,
          timeLeft,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    
    // Auto-save progress
    setTimeout(() => saveProgress(), 1000);
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      let correctAnswers = 0;
      questions.forEach((question: any, index: number) => {
        if (selectedAnswers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= 70;
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const result: AssessmentResult = {
        score,
        passed,
        totalQuestions: questions.length,
        correctAnswers,
        timeTaken,
        answers: selectedAnswers,
        completedAt: new Date().toISOString()
      };

      setAssessmentResult(result);

      console.log('Assessment result:', result);

      // Save assessment result to database
      await saveAssessmentResult(result);

      if (passed) {
        const courseId = course?._id || course?.id;
        if (user && courseId) {
          // Call backend to mark course as completed in MongoDB
          try {
            const token = localStorage.getItem('authToken');
            if (token) {
              const completeResponse = await fetch(`http://localhost:5001/api/courses/${courseId}/complete`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (completeResponse.ok) {
                const completeData = await completeResponse.json();
                console.log('Course marked as completed in MongoDB:', completeData);
                
                // Also update local state
                completeCourse(courseId, user.id);
                
                // Generate certificate only after successful completion
                await generateCertificate(result);
                
                // Check for achievements for passing assessment
                try {
                  await fetch('http://localhost:5001/api/achievements/check', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      actionType: 'PASS_ASSESSMENT',
                      courseId: courseId
                    })
                  });
                  
                  // Also check for course completion achievements 
                  await fetch('http://localhost:5001/api/achievements/check', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      actionType: 'COMPLETE_COURSE',
                      courseId: courseId
                    })
                  });
                } catch (achievementError) {
                  console.error('Error checking achievements:', achievementError);
                }
              } else {
                console.error('Failed to mark course as completed:', await completeResponse.text());
              }
            }
          } catch (error) {
            console.error('Error marking course as completed:', error);
          }
        }
      }

      setShowResults(true);
      
      // Clear saved progress
      await clearSavedProgress();
      
      // Show completion modal for successful completion
      if (passed) {
        // Set flag to indicate assessment was just completed successfully
        sessionStorage.setItem('assessmentJustCompleted', 'true');
        
        // Immediately notify parent component that assessment was passed
        if (onComplete) {
          onComplete(true);
        }
        
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 2000);
      } else {
        setTimeout(() => {
          // Let parent component know the assessment wasn't passed
          onComplete(false);
        }, 5000);
      }
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAssessmentResult = async (result: AssessmentResult) => {
    try {
      const token = localStorage.getItem('authToken');
      const courseId = course?._id || course?.id;
      if (!courseId) return;

      await fetch('http://localhost:5001/api/assessments/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          result,
          questions: questions.map((q: any, index: number) => ({
            question: q.question,
            selectedAnswer: selectedAnswers[index],
            correctAnswer: q.correctAnswer,
            isCorrect: selectedAnswers[index] === q.correctAnswer
          }))
        })
      });
    } catch (error) {
      console.error('Error saving assessment result:', error);
    }
  };

  const generateCertificate = async (result: AssessmentResult) => {
    try {
      const token = localStorage.getItem('authToken');
      const courseId = course?._id || course?.id;
      if (!courseId) return;

      await fetch('http://localhost:5001/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          certificateData: {
            certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentName: `${user?.firstName} ${user?.lastName}`,
            courseTitle: course.title,
            completionDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            score: result.score,
            courseDuration: course.duration || '2 hours',
            skills: course.skills || course.tags || ['Programming', 'Development']
          },
          issuedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const clearSavedProgress = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const courseId = course?._id || course?.id;
      if (!courseId) return;

      await fetch(`http://localhost:5001/api/assessments/progress/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error clearing saved progress:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No course selected</h2>
          <p className="text-gray-600">Please select a course to start the assessment.</p>
          <div className="mt-6">
            <button onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment not available</h2>
          <p className="text-gray-600">No questions were found for this course. Please check back later.</p>
          <div className="mt-6">
            <button onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && assessmentResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            assessmentResult.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {assessmentResult.passed ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {assessmentResult.passed ? 'Congratulations!' : 'Assessment Failed'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Final Score</p>
              <p className={`text-2xl font-bold ${assessmentResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                {assessmentResult.score}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessmentResult.correctAnswers}/{assessmentResult.totalQuestions}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Time Taken</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(assessmentResult.timeTaken)}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            {assessmentResult.passed 
              ? 'You have successfully completed the course and earned your certificate!'
              : 'You need at least 70% to pass. Please review the course materials and try again.'
            }
          </p>
          
          {assessmentResult.passed && (
            <>
              {/* Course Completion Status */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-green-700 mb-3">
                    <CheckCircle className="w-8 h-8" />
                    <span className="text-2xl font-bold">Course Completed!</span>
                  </div>
                  <p className="text-green-600 mb-4">
                    🎉 Congratulations! You've successfully completed all lessons and passed the assessment.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>All Lessons Watched</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Assessment Passed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-green-500" />
                        <span>Certificate Earned</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-6">
                <Award className="w-6 h-6" />
                <span className="font-semibold">Certificate Generated!</span>
              </div>
              
              {/* Only show completion message if both course content AND assessment are completed */}
              {courseProgress >= 100 && (
                <>
                  {/* Feedback box - shown after course and assessment completion */}
                  <div className="bg-isabelline rounded-lg p-4 mb-4 border-l-4 border-cyber-grape">
                    <p className="text-dark-gunmetal font-medium flex items-center">
                      <Star className="w-5 h-5 text-persimmon mr-2" />
                      Course & Assessment Completed!
                    </p>
                    <p className="text-sm text-dark-gunmetal/70 mt-2">
                      You've successfully completed both the course content and assessment. Congratulations on earning your certificate!
                    </p>
                  </div>
                </>
              )}
              
              {/* Show message if assessment passed but course content not fully completed */}
              {courseProgress < 100 && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4 border-l-4 border-yellow-400">
                  <p className="text-yellow-800 font-medium flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    Assessment Passed!
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    You've passed the assessment, but please make sure to complete all course videos before writing a review. This ensures you have the full learning experience.
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Course Progress: {courseProgress}% complete
                  </p>
                </div>
              )}
            </>
          )}

          <button
            className="mt-6 px-6 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg font-semibold transition-colors"
            onClick={() => {
              if (course?._id || course?.id) {
                // Ensure the completion flag is set when returning to course after success
                if (assessmentResult && assessmentResult.score >= 70) {
                  sessionStorage.setItem('assessmentJustCompleted', 'true');
                }
                navigate(`/courses/${course._id || course.id}`);
              }
            }}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Course</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Final Assessment - {course.title}
            </h1>
            <p className="text-gray-600">
              You need 70% or higher to pass and earn your certificate
            </p>
            {savedProgress && (
              <div className="flex items-center space-x-2 text-blue-600 mt-2">
                <Save className="w-4 h-4" />
                <span className="text-sm">Progress saved automatically</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyber-grape h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {questions[currentQuestion].question}
          </h2>
          
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 border rounded-lg transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-600">
            {selectedAnswers.filter(answer => answer !== undefined).length} of {questions.length} answered
          </div>
          
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitAssessment}
              disabled={selectedAnswers.some(answer => answer === undefined) || isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Make sure to answer all questions before submitting. Your progress is automatically saved.
            </span>
          </div>
        </div>
      </div>

      {/* Course Completion Modal with Review Prompt */}
      <CourseCompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          // Since this is only shown when passed, signal successful completion
          if (assessmentResult?.passed) {
            onComplete(true);
          }
        }}
        courseId={course?._id || course?.id || ''}
        courseTitle={course?.title || ''}
        onReviewSubmitted={() => {
          // Refresh course data or show success message
          console.log('Review submitted successfully');
          // Notify the parent component that assessment was passed
          if (assessmentResult?.passed) {
            onComplete(true);
          }
        }}
      />
    </div>
  );
};

export default Assessment;
