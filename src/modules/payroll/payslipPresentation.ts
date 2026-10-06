import type { PayslipPresentationQuery } from '../../api/graphql/graphql';

export interface PayslipStatement {
  gross: string;
  incentive: string;
  total_deductions: string;
  net_earned: string;
  advance_already_paid: string;
  remaining_payable: string;
  lwp_amount: string;
  lwp_days: string;
  lwp_divisor: string;
  lwp_basis_amount: string;
  gross_rule: string;
}

type GeneratedPresentation = NonNullable<PayslipPresentationQuery['payslipPresentation']>;
export type PayslipPresentation = Omit<GeneratedPresentation, 'statement'> & {
  statement: PayslipStatement | null;
};

const statementFields: (keyof PayslipStatement)[] = [
  'gross',
  'incentive',
  'total_deductions',
  'net_earned',
  'advance_already_paid',
  'remaining_payable',
  'lwp_amount',
  'lwp_days',
  'lwp_divisor',
  'lwp_basis_amount',
  'gross_rule',
];

const isPayslipStatement = (value: unknown): value is PayslipStatement =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  statementFields.every((key) => typeof Reflect.get(value, key) === 'string');

export const decodePayslipPresentation = (
  value: PayslipPresentationQuery['payslipPresentation']
): PayslipPresentation | null => {
  if (!value) return null;
  // The service publishes settlement as JSON; codegen cannot validate that scalar's shape.
  const statement: unknown = Reflect.get(value, 'statement');
  if (statement === null || statement === undefined) return { ...value, statement: null };
  if (!isPayslipStatement(statement)) throw new Error('Payslip settlement details are invalid.');
  return { ...value, statement };
};
