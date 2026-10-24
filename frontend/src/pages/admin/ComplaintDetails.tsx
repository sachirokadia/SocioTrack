import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as complaintService from '../../services/complaintService';
import { Complaint, User } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getComplaintById(id!);
      setComplaint(data);
    } catch (error) {
      console.error('Failed to load complaint:', error);
    } finally {
      setLoading(false);
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
  const technician = typeof complaint.technician === 'object' ? complaint.technician as User : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/admin/complaints')} className="mb-4 text-blue-600 hover:text-blue-800 flex items-center">
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

            {technician && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Technician</h3>
                <p className="text-gray-900">{technician.name}</p>
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

          {complaint.feedback && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resident Feedback</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-5 h-5 ${star <= complaint.feedback!.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
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

export default AdminComplaintDetails;
