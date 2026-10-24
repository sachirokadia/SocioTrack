import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as complaintService from '../../services/complaintService';
import * as noticeService from '../../services/noticeService';
import * as notificationService from '../../services/notificationService';
import * as billingService from '../../services/billingService';
import { Complaint, Notice, Notification, ComplaintStatus, MemberSummary } from '../../types';
import { formatINR } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

// Handles either _id (raw Mongoose) or id (if a toJSON transform renames
// it) so this doesn't silently break depending on which one the backend
// actually sends. Once the backend's toJSON behavior is confirmed and
// fixed at the source, this helper can go away.
const getAlertId = (alert: Notification): string | undefined =>
  (alert as any)._id ?? (alert as any).id;

const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<MemberSummary | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAlertPopup, setShowAlertPopup] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch complaints
      const { complaints: userComplaints } = await complaintService.getComplaints({ limit: 5 });
      setComplaints(userComplaints);

      // Calculate stats
      const statsCounts = {
        pending: 0,
        assigned: 0,
        in_progress: 0,
        resolved: 0,
      };

      userComplaints.forEach((c) => {
        if (c.status === ComplaintStatus.PENDING) statsCounts.pending++;
        else if (c.status === ComplaintStatus.ASSIGNED) statsCounts.assigned++;
        else if (c.status === ComplaintStatus.IN_PROGRESS) statsCounts.in_progress++;
        else if (c.status === ComplaintStatus.RESOLVED) statsCounts.resolved++;
      });

      setStats(statsCounts);

      // Fetch notices
      const { notices: latestNotices } = await noticeService.getNotices({ limit: 5 });
      setNotices(latestNotices);

      // Member (billing) summary — fetched separately so a billing
      // failure never takes down the complaints/notices dashboard
      try {
        setSummary(await billingService.getMemberSummary());
      } catch (billingError) {
        console.error('Failed to fetch member summary:', billingError);
      }

      // Fetch unread alerts
      const { notifications } = await notificationService.getNotifications({ limit: 50 });
      const unreadAlerts = notifications.filter((n) => n.type === 'alert' && !n.isRead);
      setAlerts(unreadAlerts);
      if (unreadAlerts.length > 0) {
        setShowAlertPopup(true);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string | undefined) => {
    if (!alertId) {
      console.error('dismissAlert called with a missing alert id — check the toJSON/_id vs id issue');
      return;
    }
    try {
      await notificationService.markAsRead(alertId);
      setAlerts((prev) => prev.filter((a) => getAlertId(a) !== alertId));
      if (alerts.length <= 1) {
        setShowAlertPopup(false);
      }
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Alert Popup */}
      {showAlertPopup && alerts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Important Alert</h3>
                <div className="mt-2 space-y-3">
                  {alerts.map((alert) => (
                    <div key={getAlertId(alert)} className="border-l-4 border-red-500 pl-3">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <button
                        onClick={() => dismissAlert(getAlertId(alert))}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAlertPopup(false)}
              className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Close All Alerts
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your complaints and society updates</p>
      </div>

      {/* Member Dashboard — SocietyNow-style billing strip */}
      {summary && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Last Bill Amount</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {summary.lastBill ? formatINR(summary.lastBill.amount) : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{summary.lastBill ? summary.lastBill.period : 'No bills yet'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Last Payment</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {summary.lastPayment ? formatINR(summary.lastPayment.amount) : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.lastPayment ? `${summary.lastPayment.mode} · ${summary.lastPayment.status}` : 'No payments yet'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Advance</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{formatINR(summary.advance)}</p>
              <p className="text-xs text-gray-500 mt-1">Paid over and above billed amount</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{formatINR(summary.outstanding)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.unpaidBills} unpaid bill{summary.unpaidBills === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'My Profile', path: '/resident/profile' },
              { label: 'Maintenance Bills', path: '/resident/bills' },
              { label: 'Pay Online', path: '/resident/pay' },
              { label: 'Payment History', path: '/resident/payments' },
              { label: 'AGM / EAGM', path: '/resident/meetings' },
              { label: 'View Ledger', path: '/resident/ledger' },
            ].map((tile) => (
              <Link
                key={tile.path}
                to={tile.path}
                className="bg-white rounded-lg shadow p-4 text-center text-sm font-medium text-gray-900 hover:border-blue-300 hover:shadow-md border border-transparent transition-all"
              >
                {tile.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.assigned}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.in_progress}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
            <Link to="/resident/complaints/new" className="text-sm text-blue-600 hover:text-blue-800">
              + New Complaint
            </Link>
          </div>
          <div className="p-6">
            {complaints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No complaints yet</p>
                <Link
                  to="/resident/complaints/new"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                >
                  Create your first complaint
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <Link
                    key={complaint._id}
                    to={`/resident/complaints/${complaint._id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{complaint.category}</p>
                    <div className="flex items-center justify-between">
                      <PriorityBadge priority={complaint.priority} />
                      <span className="text-xs text-gray-500">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Latest Notices */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Latest Notices</h2>
            <Link to="/resident/notices" className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          <div className="p-6">
            {notices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No notices available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div
                    key={notice._id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{notice.title}</h3>
                      <PriorityBadge priority={notice.priority} />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{notice.description}</p>
                    <span className="text-xs text-gray-500 mt-2 block">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;