import React, { useState, useEffect } from 'react';
import * as billingService from '../../services/billingService';
import { Ledger } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../utils/format';

const ResidentLedger: React.FC = () => {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingService.getLedger()
      .then(setLedger)
      .catch((err) => console.error('Failed to fetch ledger:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading ledger..." />
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Could not load your ledger.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">View Ledger</h1>
      <p className="text-gray-600 mb-8">Bills are debits, verified payments are credits. Only verified payments appear here.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Billed', value: ledger.totalBilled },
          { label: 'Total Paid', value: ledger.totalPaid },
          { label: 'Outstanding', value: ledger.outstanding },
          { label: 'Advance', value: ledger.advance },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{formatINR(card.value)}</p>
          </div>
        ))}
      </div>

      {ledger.entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No ledger entries yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ledger.entries.map((entry, i) => (
                <tr key={`${entry.ref}-${i}`}>
                  <td className="px-6 py-4 text-gray-600">{formatDate(entry.date)}</td>
                  <td className="px-6 py-4 text-gray-900">{entry.description}</td>
                  <td className="px-6 py-4 text-gray-900">{entry.debit ? formatINR(entry.debit) : '—'}</td>
                  <td className="px-6 py-4 text-gray-900">{entry.credit ? formatINR(entry.credit) : '—'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatINR(entry.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResidentLedger;
