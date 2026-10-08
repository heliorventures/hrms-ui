// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import type { TaxProjection } from '../projectionViewTypes';

import TaxProjectionTimeline from './TaxProjectionTimeline';

afterEach(cleanup);
it('keeps estimated withholding separate from actual TDS and displays aggregate history once', () => {
  const projection: TaxProjection = {
    fiscal_year: 2026,
    annual_earnings: '300000',
    tax: null,
    withholding: null,
    recorded_tds: '1000',
    history_complete: false,
    selected_monthly_tds: '2000',
    limitations: [],
    note: 'Projection only. Contact HR.',
    months: [
      {
        year: 2026,
        month: 5,
        earnings: '25000',
        tds: null,
        components: { BASIC: '25000' },
        evidence: 'HISTORICAL_ESTIMATE',
        aggregate_source: 'HR-OPENING',
      },
      {
        year: 2026,
        month: 9,
        earnings: '25000',
        tds: '1000',
        components: { BASIC: '25000' },
        evidence: 'IMPORTED_ACTUAL',
        aggregate_source: null,
      },
      {
        year: 2026,
        month: 10,
        earnings: '25000',
        tds: null,
        components: { BASIC: '25000' },
        evidence: 'FUTURE_PROJECTION',
        aggregate_source: null,
        projected_withholding: '2000',
      },
    ],
    opening_history: [
      {
        fiscal_year: 2026,
        period_start: '2026-05-01',
        period_end: '2026-08-31',
        employer: 'CURRENT',
        source_key: 'HR-OPENING',
        earnings: '100000',
        components: { BASIC: '100000' },
        tds: null,
        coverage: 'INCOMPLETE',
        reason: 'HR supplied',
        evidence: 'IMPORTED_ACTUAL',
      },
    ],
  };
  render(<TaxProjectionTimeline projection={projection} />);
  const october = screen.getByText('Future projection').closest('tr');
  expect(october).not.toBeNull();
  if (!october) throw new Error('October row missing');
  expect(within(october).getByText('Not provided')).toBeTruthy();
  expect(screen.getByText('Imported actual')).toBeTruthy();
  expect(screen.getByText('Covered by HR-OPENING')).toBeTruthy();
  expect(screen.getByText(/Monthly allocation was not supplied/)).toBeTruthy();
  expect(screen.queryByText(/tax paid|tax remitted/i)).toBeNull();
});
