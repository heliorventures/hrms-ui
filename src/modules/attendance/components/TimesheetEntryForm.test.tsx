// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import TimesheetEntryForm from './TimesheetEntryForm';

const graphClient = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphClient,
}));

beforeEach(() => {
  graphClient.request.mockResolvedValue({
    timesheetProjectsForEmployee: [],
    timesheetTaskTypes: [],
  });
});

afterEach(() => {
  cleanup();
  graphClient.request.mockReset();
});

describe('TimesheetEntryForm', () => {
  it('shows stored decimal hours in the same user-facing format as timesheet rows', () => {
    render(
      <TimesheetEntryForm
        allowedMinIso="2026-08-17"
        allowedMaxIso="2026-08-23"
        editing={{
          id: 'entry-1',
          workDate: '2026-08-19',
          hoursWorked: '2.0000',
          projectCode: 'INTERNAL',
          description: null,
        }}
        existingEntries={[]}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    );

    expect((screen.getByLabelText('Hours') as HTMLInputElement).value).toBe('2');
  });
});
