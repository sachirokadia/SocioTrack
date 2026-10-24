import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as billingService from '../../services/billingService';
import { Bill } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../utils/format';

const statusStyle: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

const ResidentBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingService.getBills()
      .then(setBills)
      .catch((err) => console.error('Failed to fetch bills:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading bills..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Bills</h1>
          <p className="text-gray-600 mt-1">Your society bills and what is still due on each</p>
        </div>
        <Link to="/resident/pay" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Pay Online
        </Link>
      </div>

      {bills.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No bills yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill._id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{bill.title}</td>
                  <td className="px-6 py-4 text-gray-600">{bill.period}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(bill.dueDate)}</td>
                  <td className="px-6 py-4 text-gray-900">{formatINR(bill.amount)}</td>
                  <td className="px-6 py-4 text-gray-900">{formatINR(bill.remainingAmount ?? bill.amount - bill.paidAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle[bill.status] || ''}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {bill.status !== 'paid' && (
                      <Link to={`/resident/pay?billId=${bill._id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        Pay
                      </Link>
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

export default ResidentBills;
