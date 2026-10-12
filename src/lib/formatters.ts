export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function calculateSavingsPercent(original: number, selling: number): number {
  if (!original || original <= selling) return 0;
  return Math.round(((original - selling) / original) * 100);
}

export function getConditionBadge(condition: string): { label: string; bg: string; text: string } {
  switch (condition) {
    case 'Brand New with Tags':
      return { label: 'New with Tags', bg: 'bg-emerald-50 border-emerald-200 shadow-2xs', text: 'text-emerald-800' };
    case 'Like New (Worn Once)':
      return { label: 'Like New', bg: 'bg-teal-50 border-teal-200 shadow-2xs', text: 'text-teal-800' };
    case 'Gently Used (Excellent)':
      return { label: 'Gently Used', bg: 'bg-blue-50 border-blue-200 shadow-2xs', text: 'text-blue-800' };
    default:
      return { label: 'Well Loved', bg: 'bg-amber-50 border-amber-200 shadow-2xs', text: 'text-amber-800' };
  }
}

export function getListingModeBadge(mode: string): { label: string; icon: string; style: string } {
  switch (mode) {
    case 'exchange_only':
      return { label: 'Swap Only', icon: '🔄', style: 'bg-pink-50 text-pink-700 border-pink-200 shadow-2xs' };
    case 'buy_and_exchange':
      return { label: 'Buy or Swap', icon: '✨', style: 'bg-teal-50 text-teal-700 border-teal-200 shadow-2xs' };
    default:
      return { label: 'Buy Only', icon: '🛍️', style: 'bg-slate-100 text-slate-700 border-slate-200 shadow-2xs' };
  }
}
