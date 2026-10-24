export const formatINR = (amount: number): string =>
  amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });

export const formatDate = (value: string | undefined): string =>
  value ? new Date(value).toLocaleDateString('en-IN') : '—';
