// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import type { LeaveRequestRow } from '../../leave/components/LeaveRequestsTableSection';

import LeaveRequestReviewDetails from './LeaveRequestReviewDetails';

afterEach(cleanup);

it('opens the combined leave calendar from an approval review', () => {
  const row: LeaveRequestRow = {
    id: 'request-1',
    employeeId: 'employee-1',
    employeeName: 'Priya Mehta',
    leaveTypeId: 'annual',
    fromDate: '2026-10-06',
    toDate: '2026-10-06',
    daysRequested: '1',
    status: 'PENDING',
    isHalfDay: false,
    appliedAt: '2026-10-01T09:00:00Z',
    viewerMayApprove: false,
  };
  render(
    <MemoryRouter initialEntries={['/hr/leaves']}>
      <Routes>
        <Route
          path="/hr/leaves"
          element={
            <LeaveRequestReviewDetails
              row={row}
              rows={[row]}
              leaveTypeNameById={new Map([['annual', 'Annual leave']])}
              showApprovalColumn={false}
              approveBusyId={null}
              cancelBusyId={null}
              onApprove={vi.fn()}
              onRejectClick={vi.fn()}
              onCancelOwn={vi.fn()}
              onOpenTrail={vi.fn()}
              onBack={vi.fn()}
            />
          }
        />
        <Route path="/leave/team-calendar" element={<p>Combined calendar destination</p>} />
      </Routes>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('link', { name: 'Open leave calendar' }));
  expect(screen.getByText('Combined calendar destination')).toBeTruthy();
});
