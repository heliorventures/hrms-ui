export interface PayslipLoanLine {
  loanId: string;
  principalBefore: string;
  interestBefore: string;
  accruedInterest: string;
  principalRecovered: string;
  interestRecovered: string;
  principalAfter: string;
  interestAfter: string;
  requested: string;
  deferred: string;
}
export interface PayslipLoans {
  currency: string;
  valueDate: string;
  total: string;
  lines: PayslipLoanLine[];
}
const moneyFields = [
  'principalBefore',
  'interestBefore',
  'accruedInterest',
  'principalRecovered',
  'interestRecovered',
  'principalAfter',
  'interestAfter',
  'requested',
  'deferred',
] as const;
const isMoney = (value: unknown): value is string =>
  typeof value === 'string' && /^\d+(?:\.\d{1,4})?$/.test(value);
const isLine = (value: unknown): value is PayslipLoanLine =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, 'loanId') === 'string' &&
  moneyFields.every((key) => isMoney(Reflect.get(value, key)));

const decodeHeader = (value: object): Omit<PayslipLoans, 'lines'> => {
  const currency: unknown = Reflect.get(value, 'currency');
  const valueDate: unknown = Reflect.get(value, 'valueDate');
  const total: unknown = Reflect.get(value, 'total');
  if (
    typeof currency !== 'string' ||
    !/^[A-Z]{3}$/.test(currency) ||
    typeof valueDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valueDate) ||
    !isMoney(total)
  ) {
    throw new Error('Payslip loan details are invalid.');
  }
  return { currency, valueDate, total };
};

export const decodePayslipLoans = (value: unknown): PayslipLoans | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'object' || value === null)
    throw new Error('Payslip loan details are invalid.');
  const header = decodeHeader(value);
  const lines: unknown = Reflect.get(value, 'lines');
  if (!Array.isArray(lines) || !lines.every(isLine)) {
    throw new Error('Payslip loan details are invalid.');
  }
  return { ...header, lines };
};

export const payslipLoanText = (
  loans: PayslipLoans,
  format: (value: string) => string
): string[] => [
  'Loan recovery and balances',
  `Payment date: ${loans.valueDate} | Currency: ${loans.currency} | Recovered: ${format(loans.total)}`,
  ...loans.lines.flatMap((line, index) => [
    `Loan ${index + 1}: Principal opening ${format(line.principalBefore)}; interest opening ${format(line.interestBefore)}.`,
    `Principal repaid ${format(line.principalRecovered)}; Interest repaid ${format(line.interestRecovered)}.`,
    `Principal remaining ${format(line.principalAfter)}; interest remaining ${format(line.interestAfter)}.`,
    `Earned interest ${format(line.accruedInterest)}; deferred recovery ${format(line.deferred)}.`,
  ]),
];
