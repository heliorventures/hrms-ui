const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export const parseStrictMoney = (raw: string): number => {
  const trimmed = raw.trim();
  if (!MONEY_PATTERN.test(trimmed)) return NaN;
  return Number(trimmed);
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
