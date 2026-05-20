const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatINR(
  amount: number,
  options?: {
    compact?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
) {
  const formatter = options?.compact ? inrCompactFormatter : inrFormatter;

  if (!options || (options.minimumFractionDigits == null && options.maximumFractionDigits == null)) {
    return formatter.format(amount);
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: options.compact ? 'compact' : 'standard',
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits ?? options.minimumFractionDigits ?? 0,
  }).format(amount);
}

export function formatSavings(amount: number) {
  return `Save ${formatINR(amount)}`;
}

export function formatCouponValue(discount: number, type: 'percent' | 'fixed') {
  return type === 'percent' ? `${discount}%` : formatINR(discount);
}
