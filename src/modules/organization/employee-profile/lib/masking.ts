/** Mask sensitive strings for display — logic only, no hardcoded user values. */
export function maskEndDigits(value: string, visibleTail: number): string {
  const v = value.replace(/\s/g, '');
  if (v.length <= visibleTail) return '•'.repeat(Math.max(4, v.length));
  const maskedLen = Math.max(4, v.length - visibleTail);
  return `${'•'.repeat(maskedLen)}${v.slice(-visibleTail)}`;
}

export function maskPan(value: string): string {
  const v = value.replace(/\s/g, '').toUpperCase();
  if (v.length < 5) return '—';
  return `${v.slice(0, 2)}•••••${v.slice(-4)}`;
}

export function formatInrAnnual(amount: number, visible: boolean): string {
  if (!visible) return '••••••';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
