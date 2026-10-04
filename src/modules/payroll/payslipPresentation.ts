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

export interface PayslipPresentation {
  lines: { id: string; code: string; name: string; componentType: string; amount: string }[];
  statement: PayslipStatement | null;
}

export const PayslipPresentationDocument = /* GraphQL */ `
  query PayslipPresentation($payslipId: ID!) {
    payslipPresentation(payslipId: $payslipId) {
      lines {
        id
        code
        name
        componentType
        amount
      }
      statement
    }
  }
`;
