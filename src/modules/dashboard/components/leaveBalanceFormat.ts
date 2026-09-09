const dayFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 20 });

export function formatLeaveDays(value: string): string {
  const number = Number(value);
  return value.trim() && Number.isFinite(number) ? dayFormat.format(number) : 'Unavailable';
}
