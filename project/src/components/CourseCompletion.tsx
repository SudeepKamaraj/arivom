import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import { ArrowLeft, Award, CheckCircle } from 'lucide-react';
import CourseCompletionModal from './CourseCompletionModal';

interface CourseCompletionProps {
  course: any;
  onBack: () => void;
}

const CourseCompletion: React.FC<CourseCompletionProps> = ({ course, onBack }) => {
  const { user } = useAuth();
  const { completeCourse } = useCourses();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionError, setCompletionError] = useState('');

  const handleCompleteCourse = async () => {
    if (!user || !course) return;

    setIsCompleting(true);
    setCompletionError('');

    try {
      const courseId = (course as any)._id || course.id;
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Call backend to mark course as completed
      const response = await fetch(`http://localhost:5001/api/courses/${courseId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete course');
      }

      // Update local state
      completeCourse(courseId, (user as any).id);

      // Show completion modal
      setShowCompletionModal(true);

    } catch (error) {
      console.error('Error completing course:', error);
      setCompletionError(error instanceof Error ? error.message : 'Failed to complete course');
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    // Auto-complete the course when component mounts
    if (course) {
      handleCompleteCourse();
    }
  }, [course]);

  if (!course) {
    return (
      <div className="min-h-screen bg-isabelline flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-gunmetal mb-4">Course not found</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-isabelline">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-dark-gunmetal hover:text-cyber-grape mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          {isCompleting ? (
            <div>
              <div className="w-16 h-16 bg-cyber-grape/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 border-4 border-cyber-grape border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-dark-gunmetal mb-4">
                Completing Course...
              </h2>
              <p className="text-dark-gunmetal/70">
                Please wait while we process your course completion.
              </p>
            </div>
          ) : completionError ? (
            <div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-dark-gunmetal mb-4">
                Completion Failed
              </h2>
              <p className="text-red-600 mb-6">{completionError}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCompleteCourse}
                  className="px-6 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-caribbean-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-caribbean-green" />
              </div>
              <h2 className="text-2xl font-bold text-dark-gunmetal mb-4">
                Course Completed!
              </h2>
              <p className="text-dark-gunmetal/70 mb-6">
                You have successfully completed <span className="font-semibold">{course.title}</span>
              </p>
              <p className="text-sm text-gray-500">
                Your certificate has been generated and is available in your profile.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Completion Modal */}
      <CourseCompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          onBack();
        }}
        courseId={(course as any)._id || course.id}
        courseTitle={course.title}
        onReviewSubmitted={() => {
          console.log('Review submitted successfully');
        }}
      />
    </div>
  );
};

export default CourseCompletion;


