export interface ReviewValueRow {
  key: string;
  current: string;
  requested: string;
}

const displayValue = (value: unknown): string => {
  if (value == null || value === '') return 'Not set';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const reviewValueRows = (
  current: Record<string, unknown>,
  requested: Record<string, unknown>
): ReviewValueRow[] => {
  const keys = [...new Set([...Object.keys(current), ...Object.keys(requested)])].sort();
  return keys.map((key) => ({
    key,
    current: displayValue(current[key]),
    requested: displayValue(requested[key]),
  }));
};

export const reviewFieldLabel = (key: string): string =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
