// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import TaxSlabBreakdown from './TaxSlabBreakdown';

afterEach(cleanup);
it('shows annual tax and statutory rounding separately from payroll deductions', () => {
  render(
    <TaxSlabBreakdown
      tax={{
        rule_version: 'IN-SALARY-FY2026-27',
        source: 'https://example.invalid/rules',
        gross: '3466548',
        standard_deduction: '75000',
        permitted_deductions: '0',
        taxable_income: '3391548',
        statutory_taxable_income: '3391550',
        slabs: [{ from: '2400000', to: '3391550', rate: '0.30', tax: '297465' }],
        slab_tax: '597465',
        rebate: '0',
        surcharge: '0',
        marginal_relief: '0',
        cess: '23898.60',
        display_tax: '621363',
        statutory_tax: '621360',
      }}
    />
  );
  expect(screen.getByText('30%')).toBeTruthy();
  expect(screen.getByText('Annual tax after statutory rounding')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Published tax rules' }).getAttribute('href')).toBe(
    'https://example.invalid/rules'
  );
  expect(screen.queryByText(/tax paid|tax remitted/i)).toBeNull();
});
