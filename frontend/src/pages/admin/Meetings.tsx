import React, { useState, useEffect } from 'react';
import * as meetingService from '../../services/meetingService';
import { Meeting, MeetingType } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/format';

const AdminMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'agm' as MeetingType,
    date: '',
    venue: '',
    agenda: '',
  });

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setMeetings(await meetingService.getMeetings());
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.title || !formData.date || !formData.agenda) {
      setError('Title, date and agenda are required');
      return;
    }
    try {
      setSubmitting(true);
      await meetingService.createMeeting(formData);
      setFormData({ title: '', type: 'agm', date: '', venue: '', agenda: '' });
      setShowForm(false);
      await fetchMeetings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this meeting?')) return;
    try {
      await meetingService.deleteMeeting(id);
      await fetchMeetings();
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      alert('Failed to delete meeting');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading meetings..." />
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AGM / EAGM</h1>
          <p className="text-gray-600 mt-1">Schedule society meetings for residents</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {showForm ? 'Cancel' : '+ New Meeting'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as MeetingType })} className={inputCls}>
                <option value="agm">AGM</option>
                <option value="eagm">EAGM</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue (optional)</label>
            <input value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
            <textarea rows={4} value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} className={inputCls} />
          </div>
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Meeting'}
          </button>
        </form>
      )}

      {meetings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center"><p className="text-gray-500">No meetings yet</p></div>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => (
            <div key={m._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{m.title}</h2>
                  <p className="text-sm text-gray-600">{formatDate(m.date)}{m.venue ? ` · ${m.venue}` : ''}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 uppercase">{m.type}</span>
                  <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
              <p className="text-gray-700 mt-2 whitespace-pre-line">{m.agenda}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMeetings;
