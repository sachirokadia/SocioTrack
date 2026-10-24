import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as billingService from '../../services/billingService';
import { Payment } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../utils/format';

const statusStyle: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const ResidentPaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    billingService.getPayments(filter ? { status: filter } : undefined)
      .then(setPayments)
      .catch((err) => console.error('Failed to fetch payments:', err))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading payment history..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">Every payment and intimation, with its verification status</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All statuses</option>
          <option value="pending">Pending verification</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No payments yet</p>
          <Link to="/resident/pay" className="inline-block mt-4 text-teal-700 hover:text-teal-900">Make a payment</Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4 text-gray-600">{formatDate(p.paymentDate)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 uppercase">{p.mode}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {p.bankName ? `${p.bankName}${p.branch ? `, ${p.branch}` : ''}` : '—'}
                    {p.chequeNumber && <div>Cheque no. {p.chequeNumber}{p.chequeDate ? `, dated ${formatDate(p.chequeDate)}` : ''}</div>}
                    {p.transactionNumber && <div>Txn no. {p.transactionNumber}</div>}
                    {typeof p.bill === 'object' && p.bill && <div>Against: {p.bill.title} ({p.bill.period})</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{formatINR(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle[p.status] || ''}`}>{p.status}</span>
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

export default ResidentPaymentHistory;
