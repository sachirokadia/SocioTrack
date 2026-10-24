import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as billingService from '../../services/billingService';
import { Bill, PaymentMode } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR } from '../../utils/format';

// Pay Online + Payment Intimation, mirroring the Society Payments screen:
// online pays immediately, cheque / RTGS / NEFT record an intimation with
// the bank, cheque and transaction details for admin verification.
const ResidentPayOnline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    billId: searchParams.get('billId') || '',
    amount: '',
    mode: 'online' as PaymentMode,
    bankName: '',
    branch: '',
    chequeNumber: '',
    chequeDate: '',
    transactionNumber: '',
    remarks: '',
  });

  useEffect(() => {
    billingService.getBills()
      .then((all) => {
        const unpaid = all.filter((b) => b.status !== 'paid');
        setBills(unpaid);
        if (formData.billId) {
          const selected = unpaid.find((b) => b._id === formData.billId);
          if (selected) {
            setFormData((prev) => ({
              ...prev,
              amount: String(selected.remainingAmount ?? selected.amount - selected.paidAmount),
            }));
          }
        }
      })
      .catch((err) => console.error('Failed to fetch bills:', err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBillChange = (billId: string) => {
    const selected = bills.find((b) => b._id === billId);
    setFormData((prev) => ({
      ...prev,
      billId,
      amount: selected ? String(selected.remainingAmount ?? selected.amount - selected.paidAmount) : prev.amount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (formData.mode === 'cheque' && (!formData.chequeNumber || !formData.bankName)) {
      setError('Cheque number and bank name are required for cheque payments');
      return;
    }
    if ((formData.mode === 'rtgs' || formData.mode === 'neft') && !formData.transactionNumber) {
      setError('Transaction number is required for RTGS/NEFT payments');
      return;
    }
    try {
      setSubmitting(true);
      const payment = await billingService.createPayment({
        billId: formData.billId || undefined,
        amount: Number(formData.amount),
        mode: formData.mode,
        bankName: formData.bankName || undefined,
        branch: formData.branch || undefined,
        chequeNumber: formData.chequeNumber || undefined,
        chequeDate: formData.chequeDate || undefined,
        transactionNumber: formData.transactionNumber || undefined,
        remarks: formData.remarks || undefined,
      });
      setSuccess(
        payment.status === 'verified'
          ? `Payment of ${formatINR(payment.amount)} recorded and verified.`
          : `Payment intimation of ${formatINR(payment.amount)} recorded — it will count once an admin verifies it.`
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay Online</h1>
      <p className="text-gray-600 mb-8">Pay a bill online, or submit a payment intimation for cheque / RTGS / NEFT.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {success} <Link to="/resident/payments" className="underline">View payment history</Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bill (optional — leave blank for an advance payment)</label>
          <select value={formData.billId} onChange={(e) => handleBillChange(e.target.value)} className={inputCls}>
            <option value="">No specific bill</option>
            {bills.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title} ({b.period}) — {formatINR(b.remainingAmount ?? b.amount - b.paidAmount)} due
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input type="number" step="0.01" min="0.01" required value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <select value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value as PaymentMode })} className={inputCls}>
            <option value="online">Online</option>
            <option value="cheque">Cheque</option>
            <option value="rtgs">RTGS</option>
            <option value="neft">NEFT</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {formData.mode !== 'online' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className={inputCls} />
            </div>
          </>
        )}

        {formData.mode === 'cheque' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No.</label>
              <input value={formData.chequeNumber} onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Date</label>
              <input type="date" value={formData.chequeDate} onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })} className={inputCls} />
            </div>
          </div>
        )}

        {(formData.mode === 'rtgs' || formData.mode === 'neft') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction No.</label>
            <input value={formData.transactionNumber} onChange={(e) => setFormData({ ...formData, transactionNumber: e.target.value })} className={inputCls} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
          <input value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className={inputCls} />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Recording...' : formData.mode === 'online' ? 'Pay Now' : 'Submit Payment Intimation'}
        </button>
      </form>
    </div>
  );
};

export default ResidentPayOnline;
