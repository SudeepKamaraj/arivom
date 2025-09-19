import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  };
  createdAt: string;
  updatedAt: string;
}

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string, reason: string) => void;
  showActions?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onMarkHelpful,
  onReport,
  showActions = true
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  console.log("Review:", review);
  // Fix: handle case where review.user is null
  const isOwnReview = user && review.user && review.user._id === (user as any).id;
  const hasMarkedHelpful = user && review.helpful.users.includes((user as any).id);
  const canMarkHelpful = user && !isOwnReview;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < rating;
      return (
        <Star
          key={index}
          className={`w-4 h-4 ${
            isFilled ? 'text-persimmon fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const handleReport = () => {
    if (reportReason && onReport) {
      onReport(review._id, reportReason);
      setShowReportModal(false);
      setReportReason('');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyber-grape/10 rounded-full flex items-center justify-center">
              {review.user ? (
                review.user.profilePicture ? (
                  <img
                    src={review.user.profilePicture}
                    alt={review.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-cyber-grape font-semibold text-sm">
                    {review.user.firstName?.charAt(0) || '?'}{review.user.lastName?.charAt(0) || '?'}
                  </span>
                )
              ) : (
                <span className="text-cyber-grape font-semibold text-sm">
                  ??
                </span>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-dark-gunmetal">
                {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous User'}
              </h4>
              <p className="text-sm text-gray-500">{review.user ? `@${review.user.username}` : 'No username'}</p>
            </div>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {isOwnReview ? (
                    <>
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit(review);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(review._id);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating and Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(review.rating)}
          </div>
          <span className="text-sm text-gray-500">
            {formatDate(review.createdAt)}
            {review.updatedAt !== review.createdAt && (
              <span className="text-gray-400 ml-1">(edited)</span>
            )}
          </span>
        </div>

        {/* Title */}
        <h5 className="font-semibold text-dark-gunmetal mb-2">
          {review.title}
        </h5>

        {/* Comment */}
        <p className="text-dark-gunmetal/80 leading-relaxed mb-4">
          {review.comment}
        </p>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {canMarkHelpful && onMarkHelpful && (
              <button
                onClick={() => onMarkHelpful(review._id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  hasMarkedHelpful
                    ? 'bg-persimmon/10 text-persimmon'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>
                  {review.helpful.count > 0 ? review.helpful.count : ''} Helpful
                </span>
              </button>
            )}

            {!canMarkHelpful && review.helpful.count > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ThumbsUp className="w-4 h-4" />
                <span>{review.helpful.count} people found this helpful</span>
              </div>
            )}

            <div className="text-xs text-gray-400">
              Verified Purchase
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-gunmetal mb-4">
              Report Review
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Why are you reporting this review?
            </p>
            <div className="space-y-2 mb-6">
              {['inappropriate', 'spam', 'fake', 'other'].map((reason) => (
                <label key={reason} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="text-cyber-grape focus:ring-cyber-grape"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {reason === 'inappropriate' ? 'Inappropriate content' :
                     reason === 'spam' ? 'Spam' :
                     reason === 'fake' ? 'Fake review' : 'Other'}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewCard;


