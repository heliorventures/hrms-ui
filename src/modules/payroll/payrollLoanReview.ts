export interface PayrollLoanReview {
  quote: {
    total: string;
    input: { value_date: string; currency: { code: string } };
    lines: { loan_id: string; principal: string; interest: string; deferred: string }[];
  };
}
