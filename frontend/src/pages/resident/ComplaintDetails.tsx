import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as complaintService from '../../services/complaintService';
import { Complaint, ComplaintStatus, User } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: '',
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getComplaintById(id!);
      setComplaint(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedbackForm.rating < 1 || feedbackForm.rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    try {
      setSubmittingFeedback(true);
      setError('');
      await complaintService.submitFeedback(id!, feedbackForm);
      await fetchComplaint(); // Refresh to show feedback
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading complaint..." />
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Complaint not found</p>
        </div>
      </div>
    );
  }

  const technicianName = complaint.technician && typeof complaint.technician === 'object'
    ? (complaint.technician as User).name
    : null;

  const canSubmitFeedback = 
    complaint.status === ComplaintStatus.RESOLVED && 
    !complaint.feedback;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/resident/complaints')}
        className="mb-4 text-teal-700 hover:text-teal-800 flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Complaints
      </button>

      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-900">{complaint.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
              <p className="text-gray-900">
                {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1).replace('_', ' ')}
              </p>
            </div>

            {complaint.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <p className="text-gray-900">{complaint.location}</p>
              </div>
            )}

            {technicianName && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Technician</h3>
                <p className="text-gray-900">{technicianName}</p>
              </div>
            )}

            {complaint.assignedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned On</h3>
                <p className="text-gray-900">{new Date(complaint.assignedAt).toLocaleDateString()}</p>
              </div>
            )}

            {complaint.resolvedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Resolved On</h3>
                <p className="text-gray-900">{new Date(complaint.resolvedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Resolution Note */}
          {complaint.resolutionNote && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resolution Note</h3>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-gray-900">{complaint.resolutionNote}</p>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {complaint.feedback ? (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Feedback</h3>
              <div className="bg-teal-50 border border-teal-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= complaint.feedback!.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                {complaint.feedback.comment && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Comment:</span>
                    <p className="text-gray-900 mt-1">{complaint.feedback.comment}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Submitted on {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : canSubmitFeedback ? (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Feedback</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please rate your experience with the resolution of this complaint
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars) *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`w-8 h-8 ${
                            star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({feedbackForm.rating} star{feedbackForm.rating !== 1 ? 's' : ''})</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment (Optional)
                  </label>
                  <textarea
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Share your experience with the resolution..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {feedbackForm.comment.length}/500 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full bg-[#2fb3a6] text-white py-2 px-4 rounded-md hover:bg-[#259a8e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
