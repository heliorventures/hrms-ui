const DECIMAL_PATTERN = /^(?:\d+(?:\.\d+)?|\.\d+)$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export const normalizeMoneyForInput = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!DECIMAL_PATTERN.test(trimmed)) return null;
  const [rawWhole = '', rawFraction = ''] = trimmed.split('.');
  const significantFraction = rawFraction.replace(/0+$/, '');
  if (significantFraction.length > 2) return null;
  const whole = (rawWhole || '0').replace(/^0+(?=\d)/, '');
  return `${whole}.${significantFraction.padEnd(2, '0')}`;
};

export const parseStrictMoney = (raw: string): number => {
  const normalized = normalizeMoneyForInput(raw);
  return normalized === null ? NaN : Number(normalized);
};

export const normalizeCurrencyCode = (raw: string): string | null => {
  const normalized = raw.trim().toUpperCase();
  return CURRENCY_PATTERN.test(normalized) ? normalized : null;
};

export const validatePositiveMoney = (raw: string, label: string): string | null => {
  const value = parseStrictMoney(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return `${label} must be a positive amount with up to 2 decimal places.`;
  }
  return null;
};
