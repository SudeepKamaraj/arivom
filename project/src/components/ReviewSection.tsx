import React, { useState, useEffect } from 'react';
import { Star, Filter, SortAsc, MessageSquare, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  helpful: {
    count: number;
    users: string[];
  };
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  } | null; // Make user optional to handle null cases
  createdAt: string;
  updatedAt: string;
}

interface ReviewSectionProps {
  courseId: string;
  courseTitle: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ courseId, courseTitle }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingData, setRatingData] = useState({
    average: 0,
    count: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterRating, setFilterRating] = useState(0);

  const fetchReviews = async (page = 1, sort = 'createdAt', rating = 0) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: sort
      });

      if (rating > 0) {
        params.append('rating', rating.toString());
      }

      const response = await fetch(`http://localhost:5001/api/reviews/course/${courseId}?${params}`);
      const data = await response.json();

      if (response.ok) {
        // Filter out any invalid reviews on the frontend as well
        const validReviews = (data.reviews || []).filter((review: any) => 
          review && review._id && typeof review.rating === 'number'
        );
        
        setReviews(validReviews);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Failed to fetch reviews:', data);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatingData = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reviews/course/${courseId}/rating`);
      const data = await response.json();
      setRatingData(data);
    } catch (error) {
      console.error('Error fetching rating data:', error);
    }
  };

  const checkCanReview = async () => {
    console.log('=== REVIEW ELIGIBILITY CHECK ===');
    console.log('Checking if user can review:', { user: !!user, courseId, reviewsCount: reviews.length });
    
    if (!user) {
      console.log('No user logged in, cannot review');
      setCanReview(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth token exists:', !!token);
      
      if (!token) {
        console.log('No auth token found');
        setCanReview(false);
        return;
      }

      console.log('Fetching course status for courseId:', courseId);

      // Check if user has completed the course
      const statusResponse = await fetch(`http://localhost:5001/api/courses/${courseId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Course status response status:', statusResponse.status);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('Course completion status data:', statusData);
        
        // IMPORTANT: Only allow reviews if backend says course is fully completed
        // This means both watching all videos AND passing the assessment
        // We no longer rely on just progress >= 100 since that only means videos are watched
        const isCompleted = statusData.completed || 
                           (statusData.debug && statusData.debug.enrollment && statusData.debug.enrollment.certificateEarned);
        
        console.log('Computed completion status:', isCompleted);
        
        if (!isCompleted) {
          console.log('Course not completed according to backend, cannot review - must pass assessment');
          
          // Check if videos are complete but assessment isn't passed
          if (statusData.progress >= 100) {
            console.log('Videos are 100% complete but assessment needs to be passed before reviewing');
          } else {
            console.log('Videos not 100% complete, cannot review');
          }
          
          setCanReview(false);
          return;
        } else {
          console.log('Course is fully completed according to backend (videos + assessment)');
        }
      } else {
        const errorText = await statusResponse.text();
        console.log('Could not fetch course status:', statusResponse.status, errorText);
        
        // Fallback: check local storage for completion
        const userId = (user as any)._id || (user as any).id;
        const completedKey = `completed_${userId}`;
        const completedCourses = JSON.parse(localStorage.getItem(completedKey) || '[]');
        const isLocallyCompleted = completedCourses.includes(courseId);
        
        console.log('Fallback to local completion check:', isLocallyCompleted);
        
        if (!isLocallyCompleted) {
          setCanReview(false);
          return;
        }
      }
      
      // Check if user has already reviewed this course
      const userReview = reviews.find(review => 
        review.user && review.user._id === ((user as any)._id || (user as any).id)
      );
      
      console.log('User review found:', !!userReview);
      
      if (userReview) {
        console.log('User has already reviewed, disabling review button');
        setCanReview(false);
      } else {
        console.log('User can review (course completed and no existing review)');
        setCanReview(true);
      }
      
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
    }
  };

  const triggerCourseCompletion = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      console.log('Triggering course completion for courseId:', courseId);
      
      const response = await fetch(`http://localhost:5001/api/courses/${courseId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Course completion triggered successfully:', data);
      } else {
        const errorText = await response.text();
        console.log('Failed to trigger course completion:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error triggering course completion:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchRatingData();
  }, [courseId]);

  useEffect(() => {
    checkCanReview();
  }, [user, reviews]); // Check after reviews are loaded

  const handleSubmitReview = async (reviewData: { rating: number; title: string; comment: string }) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      console.log('Submitting review:', { courseId, ...reviewData });
      
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
      console.log('Review submission response:', responseData);

      if (response.ok) {
        setShowReviewForm(false);
        fetchReviews();
        fetchRatingData();
        checkCanReview();
        
        // Check for achievements for submitting a review
        try {
          await fetch('http://localhost:5001/api/achievements/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              actionType: 'REVIEW_COURSE',
              courseId
            })
          });
        } catch (achievementError) {
          console.error('Error checking achievements:', achievementError);
        }
        
        alert('Thank you for your review! It has been submitted successfully.');
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
          errorMessage = 'You must complete more of the course before writing a review';
        } else if (responseData.reason === 'not_enrolled') {
          errorMessage = 'You must be enrolled in the course to write a review';
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews(currentPage, sortBy, filterRating);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5001/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Review reported successfully');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    fetchReviews(1, newSortBy, filterRating);
  };

  const handleFilterChange = (rating: number) => {
    setFilterRating(rating);
    fetchReviews(1, sortBy, rating);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < rating;
      return (
        <Star
          key={index}
          className={`${sizeClasses[size]} ${
            isFilled ? 'text-persimmon fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const renderRatingDistribution = () => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = ratingData.distribution[rating as keyof typeof ratingData.distribution];
      const percentage = ratingData.count > 0 ? (count / ratingData.count) * 100 : 0;

      return (
        <div key={rating} className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 w-2">{rating}</span>
          <Star className="w-3 h-3 text-persimmon fill-current" />
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-persimmon h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 w-8">{count}</span>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-cyber-grape" />
          <h2 className="text-xl font-semibold text-dark-gunmetal">
            Reviews ({ratingData.count})
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {canReview && (
            <div className="flex flex-col space-y-3">
              <div className="bg-isabelline rounded-lg p-4 border-l-4 border-cyber-grape">
                <p className="text-dark-gunmetal font-medium flex items-center">
                  <Star className="w-5 h-5 text-persimmon mr-2" />
                  Course Completed!
                </p>
                <p className="text-sm text-dark-gunmetal/70 mt-2">
                  You've successfully completed this course. Share your experience to help other students.
                </p>
              </div>
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Write a Review</span>
              </button>
            </div>
          )}
          
          {!canReview && user && (
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              <p className="text-yellow-800 font-medium flex items-center">
                <Lock className="w-5 h-5 text-yellow-600 mr-2" />
                {reviews.find(review => review.user && review.user._id === ((user as any)._id || (user as any).id)) 
                  ? 'Already Reviewed' 
                  : 'Complete Course to Review'}
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                {reviews.find(review => review.user && review.user._id === ((user as any)._id || (user as any).id)) 
                  ? 'You have already written a review for this course.' 
                  : 'You must complete the entire course (including any assessments) before you can write a review.'}
              </p>
              <button
                onClick={() => {
                  console.log('Manually refreshing review eligibility...');
                  checkCanReview();
                }}
                className="mt-3 mr-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
              >
                Refresh Status
              </button>
              <button
                onClick={async () => {
                  console.log('Attempting to sync course completion...');
                  await triggerCourseCompletion();
                  setTimeout(() => checkCanReview(), 1000);
                }}
                className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
              >
                Sync Completion
              </button>
            </div>
          )}
          
          {!canReview && !user && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
              <p className="text-gray-600 font-medium">
                Please log in to write a review
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Summary */}
      {ratingData.count > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-dark-gunmetal mb-2">
                {ratingData.average.toFixed(1)}
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {renderStars(Math.round(ratingData.average), 'lg')}
              </div>
              <p className="text-sm text-gray-600">
                Based on {ratingData.count} review{ratingData.count !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          courseId={courseId}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
          isLoading={isSubmitting}
        />
      )}

      {/* Filters and Sort */}
      {ratingData.count > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filterRating}
                onChange={(e) => handleFilterChange(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="createdAt">Newest First</option>
              <option value="rating">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews
            .filter(review => review && review._id) // Filter out any invalid reviews
            .map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onMarkHelpful={handleMarkHelpful}
              onReport={handleReportReview}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                onClick={() => fetchReviews(currentPage - 1, sortBy, filterRating)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchReviews(currentPage + 1, sortBy, filterRating)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No reviews yet</h3>
          <p className="text-gray-500 mb-4">
            Be the first to share your thoughts about this course!
          </p>
          {canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-cyber-grape hover:bg-cyber-grape-dark text-white rounded-lg font-medium transition-colors"
            >
              Write the first review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;


