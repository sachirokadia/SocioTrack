import React, { useState, useEffect } from 'react';
import * as billingService from '../../services/billingService';
import * as adminService from '../../services/adminService';
import { Bill, User, UserRole } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../utils/format';

const statusStyle: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

const AdminBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [residents, setResidents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    residentId: '',
    title: 'Monthly Maintenance',
    category: 'maintenance',
    period: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  const fetchBills = async () => {
    try {
      setLoading(true);
      const [billData, residentData] = await Promise.all([
        billingService.getBills(),
        adminService.getUsers(UserRole.RESIDENT),
      ]);
      setBills(billData);
      setResidents(residentData);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.residentId || !formData.period || !formData.amount || !formData.dueDate) {
      setError('Resident, period, amount and due date are required');
      return;
    }
    try {
      setSubmitting(true);
      await billingService.createBill({
        residentId: formData.residentId,
        title: formData.title,
        category: formData.category,
        period: formData.period,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        notes: formData.notes || undefined,
      });
      setFormData({ residentId: '', title: 'Monthly Maintenance', category: 'maintenance', period: '', amount: '', dueDate: '', notes: '' });
      setShowForm(false);
      await fetchBills();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading bills..." />
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Bills</h1>
          <p className="text-gray-600 mt-1">Raise bills for residents and track what is due</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {showForm ? 'Cancel' : '+ New Bill'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resident</label>
              <select value={formData.residentId} onChange={(e) => setFormData({ ...formData, residentId: e.target.value })} className={inputCls}>
                <option value="">Select resident</option>
                {residents.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}{r.flatNumber ? ` (${r.flatNumber})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period (e.g. Oct 2026)</label>
              <input value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input type="number" step="0.01" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Bill'}
          </button>
        </form>
      )}

      {bills.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center"><p className="text-gray-500">No bills yet</p></div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill._id}>
                  <td className="px-6 py-4 text-gray-900">
                    {typeof bill.resident === 'object' ? `${bill.resident.name}${bill.resident.flatNumber ? ` (${bill.resident.flatNumber})` : ''}` : bill.resident}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{bill.title}</td>
                  <td className="px-6 py-4 text-gray-600">{bill.period}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(bill.dueDate)}</td>
                  <td className="px-6 py-4 text-gray-900">{formatINR(bill.amount)}</td>
                  <td className="px-6 py-4 text-gray-900">{formatINR(bill.paidAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle[bill.status] || ''}`}>{bill.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBills;
