// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import TaxProjectionSummary from './TaxProjectionSummary';

afterEach(cleanup);
it('labels partial recorded deductions and hides unsupported remaining liability', () => {
  render(
    <TaxProjectionSummary
      projection={{
        fiscal_year: 2026,
        annual_earnings: '600000',
        tax: null,
        withholding: null,
        recorded_tds: '1000',
        history_complete: false,
        selected_monthly_tds: null,
        limitations: [],
        note: 'Projection only. Contact HR.',
        months: [],
        opening_history: [],
      }}
    />
  );
  expect(screen.getByText('Recorded TDS (partial history)')).toBeTruthy();
  expect(screen.getByText('Not available until history is complete')).toBeTruthy();
  expect(screen.queryByText(/tax paid/i)).toBeNull();
});
