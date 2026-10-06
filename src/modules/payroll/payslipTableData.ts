import type { PayslipPresentation } from './payslipPresentation';

export type DisplayLine = PayslipPresentation['lines'][number];

export const payslipLineAt = (lines: DisplayLine[], index: number): DisplayLine | undefined =>
  lines[index];

export const groupPayslipLines = (lines: DisplayLine[]) => ({
  earnings: lines.filter((line) => line.componentType === 'EARNING'),
  deductions: lines.filter((line) => line.componentType === 'DEDUCTION'),
  other: lines.filter((line) => !['EARNING', 'DEDUCTION'].includes(line.componentType)),
});

export const formatPayslipAmount = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value;
};

export const formatPayslipMoney = (value: string) => `₹${formatPayslipAmount(value)}`;
