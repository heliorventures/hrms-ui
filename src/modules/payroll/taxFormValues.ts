import { TaxFormError } from './taxFormError';

export const percentageFraction = (raw: string): string => {
  if (!/^\d{1,3}(\.\d{1,4})?$/.test(raw) || Number(raw) <= 0 || Number(raw) > 100)
    throw new TaxFormError('Enter a percentage greater than zero and no more than 100.');
  const [whole, fraction = ''] = raw.split('.');
  const units = BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0'));
  return `${units / 1000000n}.${(units % 1000000n).toString().padStart(6, '0')}`;
};
export const parseComponentAmounts = (text: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const line of text.split('\n').filter((value) => value.trim())) {
    const parts = line.split('=').map((value) => value.trim());
    const [code, amount = ''] = parts;
    if (
      parts.length !== 2 ||
      !/^[A-Z][A-Z0-9_]{0,63}$/.test(code) ||
      !/^\d+(\.\d{1,2})?$/.test(amount) ||
      code in result
    )
      throw new TaxFormError('Enter each component once, for example BASIC=25000, one per line.');
    result[code] = amount;
  }
  if (!Object.keys(result).length)
    throw new TaxFormError('Enter the actual earnings by component.');
  return result;
};
export const sumMoney = (values: string[]): string => {
  const cents = values.reduce((total, raw) => {
    const [whole, fraction = ''] = raw.split('.');
    return total + BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  }, 0n);
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, '0')}`;
};
