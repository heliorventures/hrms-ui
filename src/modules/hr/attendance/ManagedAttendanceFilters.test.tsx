// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ManagedAttendanceFilters from './ManagedAttendanceFilters';

afterEach(cleanup);

describe('ManagedAttendanceFilters', () => {
  it('accepts an inclusive 92-day date range immediately', () => {
    const onChange = vi.fn();
    render(
      <ManagedAttendanceFilters
        value={{ fromDate: '2026-08-01', toDate: '2026-08-31', employeeSearch: '' }}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-10-31' } });

    expect(onChange).toHaveBeenCalledWith({
      fromDate: '2026-08-01',
      toDate: '2026-10-31',
      employeeSearch: '',
    });
  });

  it('rejects an inclusive 93-day date range', () => {
    const onChange = vi.fn();
    render(
      <ManagedAttendanceFilters
        value={{ fromDate: '2026-08-01', toDate: '2026-10-31', employeeSearch: '' }}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-07-31' } });

    expect(screen.getByRole('alert').textContent).toContain('92 calendar days or fewer');
    expect(onChange).not.toHaveBeenCalled();
  });
});
