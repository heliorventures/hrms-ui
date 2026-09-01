// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LeaveBalancesSection from './LeaveBalancesSection';

type LeaveBalancesModel = ComponentProps<typeof LeaveBalancesSection>['model'];

const modelFor = (overrides: Partial<LeaveBalancesModel>): LeaveBalancesModel =>
  ({
    data: null,
    loading: false,
    error: null,
    provisionBusy: false,
    provisionYear: 2026,
    setProvisionYear: vi.fn(),
    runProvisionFromPolicies: vi.fn(),
    balanceForm: {
      employeeId: '',
      leaveTypeId: '',
      year: '2026',
      entitled: '0',
      used: '0',
      pending: '0',
      carried: '0',
    },
    adjustmentForm: {
      employeeId: '',
      leaveTypeId: '',
      year: '2026',
      delta: '1',
    },
    setBalanceForm: vi.fn(),
    setAdjustmentForm: vi.fn(),
    saveBalance: vi.fn(),
    adjustBalance: vi.fn(),
    ...overrides,
  }) as LeaveBalancesModel;

afterEach(cleanup);

describe('LeaveBalancesSection employee picker availability', () => {
  it('distinguishes initial loading and unavailable data from usable refresh data', () => {
    const view = render(<LeaveBalancesSection model={modelFor({ loading: true })} />);

    expect(screen.getAllByRole('status').map((status) => status.textContent)).toEqual([
      'Loading employee options.',
      'Loading employee options.',
    ]);
    expect(
      screen.getAllByRole<HTMLSelectElement>('listbox').every((listbox) => listbox.disabled)
    ).toBe(true);
    expect(screen.queryAllByText('No employees found.')).toHaveLength(0);

    view.rerender(
      <LeaveBalancesSection model={modelFor({ error: 'Directory request failed.' })} />
    );
    expect(screen.getAllByRole('status').map((status) => status.textContent)).toEqual([
      'Employee options could not be loaded. Refresh leave settings to try again.',
      'Employee options could not be loaded. Refresh leave settings to try again.',
    ]);

    view.rerender(
      <LeaveBalancesSection
        model={modelFor({
          loading: true,
          error: 'Refresh failed.',
          data: {
            employees: [{ id: 'employee-1', employeeCode: 'E001', fullName: 'Asha Rao' }],
            leaveTypes: [],
            leavePolicies: [],
            holidayCalendars: [],
          },
        })}
      />
    );
    expect(screen.getAllByRole('status').map((status) => status.textContent)).toEqual([
      '1 result available.',
      '1 result available.',
    ]);
    expect(
      screen.getAllByRole<HTMLSelectElement>('listbox').every((listbox) => !listbox.disabled)
    ).toBe(true);
  });

  it('explains invariant balance recomputation without exposing a credit toggle', () => {
    render(<LeaveBalancesSection model={modelFor({})} />);

    expect(screen.queryByRole('checkbox', { name: /available balance/i })).toBeNull();
    expect(
      screen.getByText(
        'Adjusts entitlement and consistently recomputes available balance from entitlement, carried forward, used, and pending days.'
      )
    ).toBeTruthy();
  });
});
