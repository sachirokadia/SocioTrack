import React, { useState, useEffect } from 'react';
import * as noticeService from '../../services/noticeService';
import { Notice } from '../../types';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { notices: data } = await noticeService.getNotices();
      setNotices(data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Notices & Announcements</h1>
        <p className="text-gray-600 mt-1">Stay updated with society announcements and alerts</p>
      </div>

      {notices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No notices available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className={`bg-white rounded-lg shadow p-6 ${
                notice.type === 'alert' ? 'border-l-4 border-red-500' : ''
              }`}
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
                <span className="text-sm text-gray-500">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{notice.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notices;
