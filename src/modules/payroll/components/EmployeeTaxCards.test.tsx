// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { EmployeeTaxTables } from './EmployeeTaxCards';

afterEach(cleanup);
it('shows the saved employee declaration even when there are no historical tax computations', () => {
  render(
    <EmployeeTaxTables
      computations={[]}
      proofs={[]}
      loading={false}
      hasError={false}
      submissionContext={{
        fiscal_year: 2026,
        settings: { regime: 'NEW', method: 'ANNUAL_PROJECTION', effective_from: '2026-10-01' },
        declaration: {
          revision: 2,
          input: { regime: 'NEW', gross_income: '600000', declared_deductions: '1000' },
        },
      }}
    />
  );
  expect(screen.getByText('Saved declaration · FY 2026–2027')).toBeTruthy();
  expect(screen.getByText('₹6,00,000.00')).toBeTruthy();
  expect(screen.queryByText(/No Declaration Yet/i)).toBeNull();
});
