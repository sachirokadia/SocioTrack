import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as complaintService from '../../services/complaintService';
import { Complaint, ComplaintStatus, User } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const TechnicianComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getComplaintById(id!);
      setComplaint(data);
    } catch (err) {
      console.error('Failed to load complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus: ComplaintStatus): ComplaintStatus | null => {
    switch (currentStatus) {
      case ComplaintStatus.ASSIGNED:
        return ComplaintStatus.IN_PROGRESS;
      case ComplaintStatus.IN_PROGRESS:
        return ComplaintStatus.RESOLVED;
      default:
        return null;
    }
  };

  const handleStatusUpdate = async () => {
    if (!complaint) return;

    const nextStatus = getNextStatus(complaint.status);
    if (!nextStatus) return;

    // Require resolution note for marking as resolved
    if (nextStatus === ComplaintStatus.RESOLVED && !resolutionNote.trim()) {
      setError('Resolution note is required to mark as resolved');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      await complaintService.updateComplaintStatus(
        id!,
        nextStatus,
        nextStatus === ComplaintStatus.RESOLVED ? resolutionNote : undefined
      );
      await fetchComplaint();
      setShowStatusUpdate(false);
      setResolutionNote('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading complaint..." />
      </div>
    );
  }

  if (!complaint) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-gray-600">Complaint not found</p></div>;
  }

  const createdBy = typeof complaint.createdBy === 'object' ? complaint.createdBy as User : null;
  const nextStatus = getNextStatus(complaint.status);
  const canUpdate = nextStatus !== null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/technician/complaints')}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Complaints
      </button>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
              <p className="text-sm text-gray-500 mt-1">Created on {new Date(complaint.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-900">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
              <p className="text-gray-900 capitalize">{complaint.category.replace('_', ' ')}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resident</h3>
              <p className="text-gray-900">{createdBy?.name || 'Unknown'}</p>
            </div>

            {complaint.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <p className="text-gray-900">{complaint.location}</p>
              </div>
            )}
          </div>

          {complaint.resolutionNote && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resolution Note</h3>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-gray-900">{complaint.resolutionNote}</p>
              </div>
            </div>
          )}

          {/* Status Update Section */}
          {canUpdate && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>

              {!showStatusUpdate ? (
                <button
                  onClick={() => setShowStatusUpdate(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Progress to {nextStatus === ComplaintStatus.IN_PROGRESS ? 'In Progress' : 'Resolved'}
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Update status from <strong>{complaint.status}</strong> to{' '}
                    <strong>{nextStatus === ComplaintStatus.IN_PROGRESS ? 'In Progress' : 'Resolved'}</strong>
                  </p>

                  {nextStatus === ComplaintStatus.RESOLVED && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resolution Note *
                      </label>
                      <textarea
                        value={resolutionNote}
                        onChange={(e) => {
                          setResolutionNote(e.target.value);
                          setError('');
                        }}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe how the issue was resolved..."
                      />
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updating}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Updating...' : 'Confirm Update'}
                    </button>
                    <button
                      onClick={() => {
                        setShowStatusUpdate(false);
                        setResolutionNote('');
                        setError('');
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {complaint.feedback && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resident Feedback</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= complaint.feedback!.rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianComplaintDetails;
