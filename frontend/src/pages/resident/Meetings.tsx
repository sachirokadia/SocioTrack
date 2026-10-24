import React, { useState, useEffect } from 'react';
import * as meetingService from '../../services/meetingService';
import { Meeting } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/format';

const ResidentMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meetingService.getMeetings()
      .then(setMeetings)
      .catch((err) => console.error('Failed to fetch meetings:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading meetings..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AGM / EAGM</h1>
      <p className="text-gray-600 mb-8">Society general meetings, with agenda and minutes where published.</p>

      {meetings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No meetings scheduled yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => (
            <div key={m._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-gray-900">{m.title}</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 uppercase">
                  {m.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {formatDate(m.date)}{m.venue ? ` · ${m.venue}` : ''}
              </p>
              <p className="text-gray-700 whitespace-pre-line">{m.agenda}</p>
              {m.minutes && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Minutes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{m.minutes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentMeetings;
