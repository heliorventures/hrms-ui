// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import type { HrInsights } from '../reports/reportDocuments';

import InsightSummary from './InsightSummary';

afterEach(cleanup);
const hidden: HrInsights = {
  onTimeDays: null,
  lateDays: null,
  unknownPunctualityDays: null,
  incompleteDays: null,
  joiners: null,
  exits: null,
  activeHeadcount: null,
  netSalaryGenerated: null,
  generatedPayslips: null,
  pendingRequests: null,
  includedPendingDomains: [],
  monthlyPayroll: null,
};
it('does not turn permission-hidden financial or employee metrics into zero', () => {
  render(<InsightSummary data={{ ...hidden, pendingRequests: 8 }} />);
  expect(screen.queryByText('Net salary generated')).toBeNull();
  expect(screen.queryByText('Current active employees')).toBeNull();
  expect(screen.queryByText('Incomplete attendance days')).toBeNull();
  expect(screen.getByText('Needs attention')).toBeTruthy();
});
it('shows an empty state when every metric is unavailable', () => {
  render(<InsightSummary data={hidden} />);
  expect(screen.getByRole('status').textContent).toContain('current permissions');
});
