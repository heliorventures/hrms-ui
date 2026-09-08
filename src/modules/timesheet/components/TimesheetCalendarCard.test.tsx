// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TimesheetCalendarCard from './TimesheetCalendarCard';

afterEach(cleanup);

describe('TimesheetCalendarCard', () => {
  it('offers the same day actions in the narrow agenda as the weekly calendar', () => {
    const onAddForDate = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <TimesheetCalendarCard
        calendarWeeks={[
          [
            { iso: '2026-09-07', inPrimaryRange: true },
            { iso: '2026-09-08', inPrimaryRange: true },
          ],
        ]}
        deleteBusyId={null}
        entriesByDate={
          new Map([
            [
              '2026-09-07',
              [
                {
                  id: 'entry-1',
                  workDate: '2026-09-07',
                  hoursWorked: '8',
                  projectCode: 'HRMS',
                  description: '[task:Planning]',
                  status: 'DRAFT',
                },
                {
                  id: 'entry-2',
                  workDate: '2026-09-07',
                  hoursWorked: '8',
                  projectCode: 'HRMS',
                  description: '[task:Development]',
                  status: 'DRAFT',
                },
              ],
            ],
          ])
        }
        error={null}
        loading={false}
        sortedCount={2}
        todayIso="2026-09-08"
        totalHours={16}
        canWrite
        canAddOnDate={() => true}
        canEditRow={() => true}
        editDisabledReason={() => ''}
        onAddForDate={onAddForDate}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    );

    const agenda = screen.getByRole('list', { name: 'Timesheet agenda' });
    const agendaEdit = within(agenda).getByRole('button', { name: /Edit.*HRMS.*Planning/ });
    expect(agendaEdit.textContent).toContain('Planning');
    expect(
      within(agenda).getByRole('button', { name: /Edit.*HRMS.*Development/ }).textContent
    ).toContain('Development');
    fireEvent.click(agendaEdit);
    fireEvent.click(within(agenda).getByRole('button', { name: /Delete.*HRMS.*Development/ }));
    fireEvent.click(within(agenda).getByRole('button', { name: 'Add entry for 8 September 2026' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'entry-1' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'entry-2' }));
    expect(onAddForDate).toHaveBeenCalledWith('2026-09-08');
  });
});
