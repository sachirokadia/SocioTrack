import React, { useState, useEffect } from 'react';
import * as noticeService from '../../services/noticeService';
import { Notice, Priority, NoticeType } from '../../types';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'notice' as NoticeType,
    priority: Priority.MEDIUM,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { notices: data } = await noticeService.getNotices();
      setNotices(data);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await noticeService.createNotice(formData);
      setFormData({ title: '', description: '', type: 'notice', priority: Priority.MEDIUM });
      setShowForm(false);
      await fetchNotices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      await noticeService.deleteNotice(id);
      await fetchNotices();
    } catch (err) {
      console.error('Failed to delete notice:', err);
      alert('Failed to delete notice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading notices..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notice Management</h1>
            <p className="text-gray-600 mt-1">Create and manage society notices and alerts</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2fb3a6] text-white px-4 py-2 rounded-md hover:bg-[#259a8e]"
          >
            {showForm ? 'Cancel' : '+ Create Notice'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Notice/Alert</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as NoticeType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="notice">Notice</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={Priority.LOW}>Low</option>
                  <option value={Priority.MEDIUM}>Medium</option>
                  <option value={Priority.HIGH}>High</option>
                  <option value={Priority.URGENT}>Urgent</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2fb3a6] text-white py-2 px-4 rounded-md hover:bg-[#259a8e] disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No notices created yet</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className={`bg-white rounded-lg shadow p-6 ${notice.type === 'alert' ? 'border-l-4 border-red-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {notice.type === 'alert' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Alert
                      </span>
                    )}
                    <PriorityBadge priority={notice.priority} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{notice.title}</h2>
                </div>
                <button
                  onClick={() => handleDelete(notice._id!)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{notice.description}</p>
              <span className="text-xs text-gray-500 mt-2 block">
                {new Date(notice.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotices;
