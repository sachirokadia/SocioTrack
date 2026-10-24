import React, { useState, useEffect } from 'react';
import * as billingService from '../../services/billingService';
import { Payment } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../utils/format';

const statusStyle: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

// Admin verification queue for payment intimations (cheque / RTGS /
// NEFT). Verifying a payment applies it to its bill; rejecting leaves
// the bill untouched.
const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setPayments(await billingService.getPayments(filter ? { status: filter } : undefined));
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await billingService.verifyPayment(id, status);
      await fetchPayments();
    } catch (err) {
      console.error('Failed to verify payment:', err);
      alert('Failed to update payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Verify payment intimations so they count against bills</p>
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
        <div className="bg-white rounded-lg shadow p-12 text-center"><p className="text-gray-500">No payments found</p></div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode / Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4 text-gray-900">
                    {typeof p.resident === 'object' ? `${p.resident.name}${p.resident.flatNumber ? ` (${p.resident.flatNumber})` : ''}` : p.resident}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(p.paymentDate)}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    <span className="uppercase font-medium text-gray-900">{p.mode}</span>
                    {p.bankName && <div>{p.bankName}{p.branch ? `, ${p.branch}` : ''}</div>}
                    {p.chequeNumber && <div>Cheque no. {p.chequeNumber}{p.chequeDate ? `, ${formatDate(p.chequeDate)}` : ''}</div>}
                    {p.transactionNumber && <div>Txn no. {p.transactionNumber}</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{formatINR(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle[p.status] || ''}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => handleVerify(p._id, 'verified')} className="text-green-600 hover:text-green-800 text-sm">Verify</button>
                        <button onClick={() => handleVerify(p._id, 'rejected')} className="text-red-600 hover:text-red-800 text-sm">Reject</button>
                      </>
                    )}
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

export default AdminPayments;
