// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import WeeklyOffSettings from './WeeklyOffSettings';
const client = vi.hoisted(() => ({ request: vi.fn() }));
const request = client.request;
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => client }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ tenantId: 'tenant', user: { id: 'user' }, clientSession: null }),
}));
vi.mock('./CompanyLocationPicker', () => ({ default: () => null }));
afterEach(() => {
  cleanup();
  request.mockReset();
});
const policy = {
  activationDate: '2026-10-06',
  businessDate: '2026-10-06',
  revision: 3,
  locationId: null,
  currentVersion: {
    id: 'version',
    effectiveFrom: '2026-10-06',
    inheritsDefault: false,
    fixedWeekdays: [7],
    saturdayOrdinals: [2, 4],
  },
  scheduledVersions: [],
};
it('previews second and fourth Saturdays and prevents conflicting every-Saturday selection', async () => {
  request.mockImplementation((document: string) =>
    Promise.resolve(
      document.includes('query PreviewWeeklyOffMonth')
        ? { previewWeeklyOffMonth: ['2026-10-10', '2026-10-24'] }
        : { workingCalendarPolicy: policy }
    )
  );
  render(<WeeklyOffSettings />);
  await waitFor(() =>
    expect((screen.getByLabelText('Second') as HTMLInputElement).checked).toBe(true)
  );
  expect((screen.getByLabelText('Fourth') as HTMLInputElement).checked).toBe(true);
  expect((screen.getByLabelText('Saturday') as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(screen.getByText('Preview Off Dates'));
  await waitFor(() => expect(screen.getByText(/Weekly offs: 2026-10-10, 2026-10-24/)).toBeTruthy());
  const call = request.mock.calls.find(([document]) =>
    document.includes('query PreviewWeeklyOffMonth')
  );
  expect(call?.[1]).toMatchObject({
    rule: { fixedWeekdays: [7], saturdayOrdinals: [2, 4] },
    month: 10,
    year: 2026,
  });
  expect(call?.[0]).not.toContain('fragment WorkingCalendarFields');
});
