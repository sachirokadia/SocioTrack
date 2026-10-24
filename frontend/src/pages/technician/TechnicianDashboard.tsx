import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as complaintService from '../../services/complaintService';
import { Complaint } from '../../types';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

interface StatusGroup {
  count: number;
  complaints: Complaint[];
}

interface TechnicianDashboardData {
  groupedComplaints: {
    pending: StatusGroup;
    assigned: StatusGroup;
    in_progress: StatusGroup;
    resolved: StatusGroup;
    rejected: StatusGroup;
  };
  summary: {
    assigned: number;
    inProgress: number;
    pending: number;
    resolved: number;
    total: number;
  };
}

const TechnicianDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<TechnicianDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getTechnicianDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Failed to load dashboard</div>
      </div>
    );
  }

  const { assigned, in_progress, resolved } = dashboardData.groupedComplaints;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Technician Dashboard</h1>
        <p className="text-gray-600 mt-1">Your assigned complaints grouped by status</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{assigned.count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{in_progress.count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{resolved.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Complaints */}
      <div className="space-y-8">
        {/* Assigned */}
        {assigned.complaints.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Assigned ({assigned.count})</h2>
            </div>
            <div className="p-6 space-y-4">
              {assigned.complaints.map((complaint: any) => (
                <Link
                  key={complaint._id ?? complaint.id}
                  to={`/technician/complaints/${complaint._id ?? complaint.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{complaint.category}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {in_progress.complaints.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">In Progress ({in_progress.count})</h2>
            </div>
            <div className="p-6 space-y-4">
              {in_progress.complaints.map((complaint: any) => (
                <Link
                  key={complaint._id ?? complaint.id}
                  to={`/technician/complaints/${complaint._id ?? complaint.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{complaint.category}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resolved */}
        {resolved.complaints.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Resolved ({resolved.count})</h2>
            </div>
            <div className="p-6 space-y-4">
              {resolved.complaints.slice(0, 5).map((complaint: any) => (
                <Link
                  key={complaint._id ?? complaint.id}
                  to={`/technician/complaints/${complaint._id ?? complaint.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{complaint.category}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;