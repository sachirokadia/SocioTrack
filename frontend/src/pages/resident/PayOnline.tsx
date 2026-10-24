import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as billingService from '../../services/billingService';
import { Bill, PaymentMode } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatINR } from '../../utils/format';

// Society Payments screen from the right phone of the promo: teal
// header, a PAYMENT INTIMATION block, and paired label/value rows —
// Mode / Date, Cheque no. / Cheque Date, Bank Name / Branch, Amount,
// then the RTGS / NEFT transaction row. Online pays immediately;
// cheque / RTGS / NEFT record an intimation for admin verification.
const ResidentPayOnline: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({
    billId: searchParams.get('billId') || '',
    amount: '',
    mode: 'online' as PaymentMode,
    date: today,
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
        paymentDate: formData.date || undefined,
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

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="society-teal px-6 py-3 flex items-center">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <h1 className="ml-3 text-lg font-semibold text-white">Society Payments</h1>
        </div>

        <div className="p-6">
          <span className="society-teal text-white text-sm font-semibold px-4 py-1.5 rounded-sm inline-block">
            PAYMENT INTIMATION
          </span>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">{error}</div>}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mt-4">
              {success} <Link to="/resident/payments" className="underline">View payment history</Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className={labelCls}>Bill (optional — leave blank for an advance payment)</label>
              <select value={formData.billId} onChange={(e) => handleBillChange(e.target.value)} className={inputCls}>
                <option value="">No specific bill</option>
                {bills.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title} ({b.period}) — {formatINR(b.remainingAmount ?? b.amount - b.paidAmount)} due
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Mode</label>
                <select value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as PaymentMode })} className={inputCls}>
                  <option value="online">Online</option>
                  <option value="cheque">Cheque</option>
                  <option value="rtgs">RTGS</option>
                  <option value="neft">NEFT</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={inputCls} />
              </div>
            </div>

            {formData.mode === 'cheque' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Cheque no.</label>
                  <input value={formData.chequeNumber} onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Cheque Date</label>
                  <input type="date" value={formData.chequeDate} onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })} className={inputCls} />
                </div>
              </div>
            )}

            {formData.mode !== 'online' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Bank Name</label>
                  <input value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bank Branch</label>
                  <input value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className={inputCls} />
                </div>
              </div>
            )}

            {(formData.mode === 'rtgs' || formData.mode === 'neft') && (
              <div>
                <label className={labelCls}>NEFT / RTGS Transaction no.</label>
                <input value={formData.transactionNumber} onChange={(e) => setFormData({ ...formData, transactionNumber: e.target.value })} className={inputCls} />
              </div>
            )}

            <div>
              <label className={labelCls}>Amount</label>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-teal-500 px-3">
                <span className="text-teal-600 font-bold text-xl">₹</span>
                <input type="number" step="0.01" min="0.01" required value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-2 py-2 outline-none text-teal-700 font-semibold text-lg" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Remarks (optional)</label>
              <input value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className={inputCls} />
            </div>

            <button type="submit" disabled={submitting}
              className="society-teal w-full text-white py-2.5 px-4 rounded-md hover:opacity-90 disabled:opacity-50 font-semibold">
              {submitting ? 'Recording...' : formData.mode === 'online' ? 'Pay Now' : 'Submit Payment Intimation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResidentPayOnline;
