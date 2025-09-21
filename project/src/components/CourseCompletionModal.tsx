import React, { useState, useEffect } from 'react';
import { CheckCircle, Award, Star, X, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onReviewSubmitted?: () => void;
}

const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onReviewSubmitted
}) => {
  // Always start with review form when modal is opened
  const [showReviewForm, setShowReviewForm] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Debug information
  useEffect(() => {
    if (isOpen) {
      console.log('CourseCompletionModal opened with:', { courseId, courseTitle });
    }
  }, [isOpen, courseId, courseTitle]);

  const handleSubmitReview = async (reviewData: { rating: number; title: string; comment: string }) => {
    try {
      setIsSubmittingReview(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('You must be logged in to submit a review');
        setIsSubmittingReview(false);
        return;
      }
      
      console.log('Submitting review:', { courseId, ...reviewData });
      
      // Using the same port as the server
      const response = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          ...reviewData
        })
      });

      const responseData = await response.json();
      console.log('Review response:', responseData);
      
      if (response.ok) {
        setShowReviewForm(false);
        // Notify parent component that review was submitted successfully
        onReviewSubmitted?.();
        // Close the modal after successful submission
        setTimeout(() => {
          onClose();
          // Show feedback to the user using a browser alert for now
          alert("Thank you for your review! Your feedback helps other students.");
        }, 500);
      } else {
        console.error('Review submission failed:', responseData);
        let errorMessage = 'Failed to submit review';
        
        if (responseData.message) {
          errorMessage = responseData.message;
        }
        
        // Handle specific error cases
        if (responseData.reason === 'already_reviewed') {
          errorMessage = 'You have already reviewed this course';
        } else if (responseData.reason === 'course_not_completed') {
          errorMessage = 'You must complete the course before writing a review';
        } else if (responseData.reason === 'not_enrolled') {
          errorMessage = 'You must be enrolled in the course to write a review';
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Failed to submit review. Please check your connection and try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!showReviewForm ? (
          // Completion Success Screen
          <div className="p-8 text-center">
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-20 h-20 bg-caribbean-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-caribbean-green" />
              </div>
              <h2 className="text-2xl font-bold text-dark-gunmetal mb-2">
                Congratulations!
              </h2>
              <p className="text-dark-gunmetal/70">
                You have successfully completed <span className="font-semibold">{courseTitle}</span>
              </p>
            </div>

            <div className="bg-isabelline rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 text-caribbean-green mb-3">
                <Award className="w-6 h-6" />
                <span className="font-semibold">Certificate Earned</span>
              </div>
              <p className="text-sm text-dark-gunmetal/70">
                Your certificate has been generated and is available in your profile.
              </p>
            </div>

            <div className="space-y-4 bg-isabelline rounded-lg p-6 border-l-4 border-cyber-grape">
              <h3 className="text-lg font-semibold text-dark-gunmetal flex items-center">
                <Star className="w-5 h-5 text-persimmon mr-2" />
                Share Your Experience
              </h3>
              <p className="text-dark-gunmetal/70">
                Help other students by writing a review about this course. Your feedback is extremely valuable and helps improve our courses!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Write a Review</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-dark-gunmetal/70">
                <strong>Why your review matters:</strong> Your honest feedback helps us improve our courses and helps other students make informed decisions. Reviews only take a minute but make a big difference!
              </p>
              <p className="text-xs text-gray-500 mt-2">
                You can always write a review later from the course page.
              </p>
            </div>
          </div>
        ) : (
          // Review Form
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-dark-gunmetal">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ReviewForm
              courseId={courseId}
              onSubmit={handleSubmitReview}
              onCancel={() => setShowReviewForm(false)}
              isLoading={isSubmittingReview}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCompletionModal;


