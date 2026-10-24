import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as complaintService from '../../services/complaintService';
import { Complaint, ComplaintStatus, User, COMPLAINT_CATEGORIES } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState('');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.status) filterParams.status = filters.status;
      if (filters.category) filterParams.category = filters.category;

      const [complaintsData, techsData] = await Promise.all([
        complaintService.getComplaints(filterParams),
        complaintService.getTechnicians(),
      ]);

      setComplaints(complaintsData.complaints);
      setTechnicians(techsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (complaintId: string) => {
    if (!selectedTech) return;

    try {
      await complaintService.assignTechnician(complaintId, selectedTech);
      setAssigningTo(null);
      setSelectedTech('');
      await fetchData();
    } catch (error) {
      console.error('Failed to assign technician:', error);
      alert('Failed to assign technician');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
        <p className="text-gray-600 mt-1">View and assign complaints to technicians</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Statuses</option>
              <option value={ComplaintStatus.PENDING}>Pending</option>
              <option value={ComplaintStatus.ASSIGNED}>Assigned</option>
              <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
              <option value={ComplaintStatus.RESOLVED}>Resolved</option>
              <option value={ComplaintStatus.REJECTED}>Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', category: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading complaints..." />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No complaints found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => {
                const createdBy = typeof complaint.createdBy === 'object' ? complaint.createdBy as User : null;
                const technician = typeof complaint.technician === 'object' ? complaint.technician as User : null;

                return (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {createdBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {complaint.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {technician ? (
                        <span className="text-gray-900">{technician.name}</span>
                      ) : assigningTo === complaint._id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedTech}
                            onChange={(e) => setSelectedTech(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select...</option>
                            {technicians.map((tech) => (
                              <option key={tech._id} value={tech._id}>
                                {tech.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(complaint._id!)}
                            className="text-teal-700 hover:text-teal-800"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setAssigningTo(null);
                              setSelectedTech('');
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningTo(complaint._id!)}
                          className="text-teal-700 hover:text-teal-800"
                          disabled={complaint.status !== ComplaintStatus.PENDING}
                        >
                          {complaint.status === ComplaintStatus.PENDING ? 'Assign' : '-'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/admin/complaints/${complaint._id}`}
                        className="text-teal-700 hover:text-teal-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
